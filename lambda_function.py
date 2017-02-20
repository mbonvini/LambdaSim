"""
This module contains the source code of the lambda
function that is deployed on AWS and processes the
HTTP requests forwarded by API gateway.
"""
from __future__ import print_function
import os
import copy
import logging
import json
import re
import ctypes
import zipfile
import boto3

# Constants used by the application
LEVEL = logging.WARNING
LOG_FORMAT = "%(asctime)s %(message)s"
LOG_DATE_FORMAT = "%m/%d/%Y %I:%M:%S %p"
CONFIG_FILE = "./config.json"
TMP_DIR = os.path.join("/", "tmp")
FMU_LOG_FILE = os.path.join(TMP_DIR, "log.txt")
APPLICATION_JSON = "application/json"
APPLICATION_XML = "application/xml"
MODEL_DESCRIPTION_FILE = "modelDescription.xml"
GET = "GET"
POST = "POST"
STATUS_OK = "200"
STATUS_NO_ACCESS = "400"
STATUS_BAD_REQUEST = "400"
STATUS_NOT_FOUND = "404"
INTERNAL_ERROR = "500"

# name of env variables
LOG_LEVEL = "LS_LOG_LEVEL"
S3_FMU_BUCKET_NAME = "S3_FMU_BUCKET_NAME"

# event keywords
HTTP_METHOD = "httpMethod"
BODY = "body"

# config dict keywords
MODEL = "model"
FMU_NAME = "fmu_name"


# Set the logger and its logging level (use the environmental
# variable if present)
if LOG_LEVEL in os.environ:
    try:
        log_level = int(os.environ[LOG_LEVEL])
        if log_level >= 0 and log_level <= 50:
            LEVEL = log_level
    except (ValueError, KeyError) as e:
        print(str(e))

logging.basicConfig(
    level=LEVEL, format=LOG_FORMAT, datefmt=LOG_DATE_FORMAT
)

# Load the config JSON file that is part of the ZIP.
# This file contains info about the model, simulation parameters
# and other settings.
logging.info("Open config file {}".format(CONFIG_FILE))
app_config = json.loads(open(CONFIG_FILE).read())


# Get the access control allow origin that is places in the header of the
# HTTP responses.
try:
    ACCESS_CONTROL_ALLOW_ORIGIN = app_config["lambda"]["access_control_allow_origin"]
except (KeyError, ValueError) as err:
    ACCESS_CONTROL_ALLOW_ORIGIN = '*'


# Get the name of the S3 bucket containing the FMU
# from the environmental variable S3_FMU_BUCKET_NAME
if S3_FMU_BUCKET_NAME not in os.environ:
    logging.error("The env variable {} is missing".format(S3_FMU_BUCKET_NAME))
else:
    BUCKET_NAME = os.environ[S3_FMU_BUCKET_NAME]

# Load the FMU from S3 and extract the XML
FMU_NAME = app_config[MODEL][FMU_NAME]
LOCAL_FMU_PATH = os.path.join(TMP_DIR, FMU_NAME)
LOCAL_FMU_DESCRIPTION_FILE = os.path.join(TMP_DIR, MODEL_DESCRIPTION_FILE)
if not os.path.exists(LOCAL_FMU_PATH):
    logging.info('Download FMU from S3...')
    s3 = boto3.resource('s3')
    s3.meta.client.download_file(BUCKET_NAME, FMU_NAME, LOCAL_FMU_PATH)

    z = zipfile.ZipFile(LOCAL_FMU_PATH)
    xml_description = z.open(MODEL_DESCRIPTION_FILE).read()
    xml_description.replace("\n","").replace("\t","")
    with open(LOCAL_FMU_DESCRIPTION_FILE, "w") as f:
        f.write(xml_description)


# Load the *.so files required by
# - numpy,
# - scipy,
# - assimulo,
# - pyfmi,
# - lxml
to_resolve = []
added = []
logging.info("Load shared objects *.so")
for dir_base in ['./lib', './sundials', './fmilib']:
    for d, dirs, files in os.walk('./lib'):
        for f in files:
            if re.match(r'^.*\.so\.*', f):
                try:
                    dll = os.path.join(d, f)
                    ctypes.cdll.LoadLibrary(dll)
                    added.append(dll)
                except Exception, e:
                    logging.warning(str(e))
                    to_resolve.append(dll)
            else:
                continue

for d, dirs, files in os.walk('.'):
    for f in files:
        dll = os.path.join(d, f)
        if re.match(r'^.*\.so\.*', f) and dll not in added:
            try:
                ctypes.cdll.LoadLibrary(dll)
            except Exception, e:
                logging.warning(str(e))
                to_resolve.append(dll)
        else:
            continue

import numpy as np
from pyfmi import load_fmu

logging.info("Load FMU model {}".format(LOCAL_FMU_PATH))
model = load_fmu(LOCAL_FMU_PATH, enable_logging=False, log_file_name=FMU_LOG_FILE)

try:
    MIN_SIM_TIME = float(app_config["simulation_time"]["min"])
except (KeyError, ValueError) as err:
    MIN_SIM_TIME = 0.0

try:
    MAX_SIM_TIME = float(app_config["simulation_time"]["max"])
except (KeyError, ValueError) as err:
    MAX_SIM_TIME = 10000.0

try:
    N_POINTS = int(app_config["n_points"]["default"])
except (KeyError, ValueError) as err:
    N_POINTS = 500

try:
    N_POINTS_MIN = int(app_config["n_points"]["min"])
except (KeyError, ValueError) as err:
    N_POINTS_MIN = 300

try:
    N_POINTS_MAX = int(app_config["n_points"]["max"])
except (KeyError, ValueError) as err:
    N_POINTS_MAX = 1000

DEFAULT_OPTIONS = model.simulate_options()
DEFAULT_OPTIONS = dict(ncp=N_POINTS)
if "options" in app_config:
    DEFAULT_OPTIONS.update(app_config["options"])


class ErrorMessage(object):
    """Class representing an HTTP error with code and message."""

    def __init__(self, code=None, msg=""):
        """Init Error message object"""
        self.code = code
        self.message = msg

    def dumps(self):
        """Return JSON string containing error code and message."""
        return json.dumps(dict(code=self.code, error_message=self.message))


def respond(err, res="", content_type=APPLICATION_JSON):
    """
    This function builds and returns an HTTP response
    object.
    """
    return {
        'statusCode': STATUS_OK if err is None else err.code,
        'body': err.dumps() if err else res,
        'headers': {
            'Content-Type': content_type,
            'Access-Control-Allow-Origin': ACCESS_CONTROL_ALLOW_ORIGIN
        },
    }

def get_handler():
    """
    This function handles HTTP GET requests.

    @TODO: Add query parameter that returns
    - JSON default simulation options
    - JSON function config
    """
    with open(LOCAL_FMU_DESCRIPTION_FILE, "r") as xml_file:
        return respond(None, xml_file.read(), content_type=APPLICATION_XML)
    return respond(
        ErrorMessage(404, "Model description file not found")
    )

def post_handler(event, context):
    """
    This function handles HTTP POST requests.
    A POST request represents a request to run a simulation.

    The content of the POST request that is for example submitted
    with the following curl command
    ::

      curl -H "Content-Type: application/json" \
      -X POST -d '{"start_time":0.0,"final_time":10.0}' \
      https://<api_id>.execute-api.us-west-2.amazonaws.com/prod/<function_name>

    is available under the ``body`` of the ``event`` dictionary.
    """
    # Parse the body of the HTTP request
    body = json.loads(event[BODY])

    # Validate the ``start_time``
    try:
        start_time = float(body["start_time"])
        if start_time < MIN_SIM_TIME or start_time > MAX_SIM_TIME:
            raise ValueError()
    except KeyError:
        return respond(ErrorMessage(STATUS_BAD_REQUEST, "Missing parameter 'start_time'"))
    except ValueError:
        msg = (
            "Invalid parameter value 'start_time'={0}. "
            "It must be between [{1}, {2}]."
        ).format(
            body["start_time"], MIN_SIM_TIME, MAX_SIM_TIME
        )
        return respond(ErrorMessage(STATUS_BAD_REQUEST, msg))

    # Validate the ``final_time``
    try:
        final_time = float(body["final_time"])
        if final_time < MIN_SIM_TIME or final_time > MAX_SIM_TIME:
            raise ValueError()
    except KeyError:
        return respond(ErrorMessage(STATUS_BAD_REQUEST, "Missing parameter 'final_time'"))
    except ValueError:
        msg = (
            "Invalid parameter value 'final_time'={0}. "
            "It must be between [{1}, {2}]."
        ).format(
            body["final_time"], MIN_SIM_TIME, MAX_SIM_TIME
        )
        return respond(ErrorMessage(STATUS_BAD_REQUEST, msg))

    # Verify the start and final time are consistent
    if final_time <= start_time:
        msg = "The parameter 'final_time'={} <= 'start_time'={}".format(
            final_time, start_time
        )
        return respond(ErrorMessage(STATUS_BAD_REQUEST, msg))

    # Try to set the options
    opts = copy.copy(DEFAULT_OPTIONS)
    if "options" in body:
        opts.update(body["options"])

    # Force the option that keeps the outputs in memory
    opts["result_handling"] = "memory"

    # @TODO: Set the model parameters
    # @TODO: Set the states
    # @TODO: Build an input matrix if needed
    input_tuple = ()

    # Simulate and reset
    try:
        res = model.simulate(
            start_time=start_time,
            final_time=final_time,
            input=input_tuple,
            options=opts
        )
        model.reset()
    except Exception, e:
        msg = "Internal error while simulating the model: {}".format(str(e))
        return respond(ErrorMessage(INTERNAL_ERROR, msg))

    # Convert result to a dictionary and then JSON (filter the protected variables that
    # start with an underscore)
    # @TODO: return single value for parameters and constants
    # @TODO: add filter based on whitelist
    result_dict = dict(
        [("time", res["time"].tolist())] + \
        [(k, res[k].tolist()) for k in res.keys() if k[0] != '_']
    )
    return respond(None, json.dumps(result_dict))

def lambda_handler(event, context):
    """
    This fucntion receives the data from the API Gateway. It has full
    access to the request and response payload, including headers and
    status code.
    """
    operation = event[HTTP_METHOD]

    if operation == GET:
        return get_handler()
    elif operation == POST:
        return post_handler(event, context)
    else:
        return respond(
            ErrorMessage(400, "HTTP method {} is not available".format(operation))
        )
