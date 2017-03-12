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
S3 = "s3"
FOLDER = "folder"
INPUT_FILES = "input_files"

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

# Create S3 resource object
s3 = boto3.resource('s3')

# Load the FMU from S3 and extract the XML
FMU_NAME = app_config[MODEL][FMU_NAME]
S3_FOLDER = app_config[S3][FOLDER]
S3_FMU_PATH = "{}/{}".format(S3_FOLDER, FMU_NAME)
LOCAL_FMU_PATH = os.path.join(TMP_DIR, FMU_NAME)
LOCAL_FMU_DESCRIPTION_FILE = os.path.join(TMP_DIR, MODEL_DESCRIPTION_FILE)
if not os.path.exists(LOCAL_FMU_PATH):
    logging.info('Download FMU from S3...')
    s3.meta.client.download_file(BUCKET_NAME, S3_FMU_PATH, LOCAL_FMU_PATH)

    z = zipfile.ZipFile(LOCAL_FMU_PATH)
    xml_description = z.open(MODEL_DESCRIPTION_FILE).read()
    xml_description.replace("\n", "").replace("\t", "")
    with open(LOCAL_FMU_DESCRIPTION_FILE, "w") as f:
        f.write(xml_description)

# Load the input files (if present)
INPUT_FILE_NAMES = app_config[MODEL][INPUT_FILES]
model_has_input_files = len(INPUT_FILE_NAMES) > 0

LOCAL_INPUT_FILES_FOLDER_PATH = os.path.join(TMP_DIR, "inputs")
if not os.path.exists(LOCAL_INPUT_FILES_FOLDER_PATH):
    os.makedirs(LOCAL_INPUT_FILES_FOLDER_PATH)

for input_file_name in INPUT_FILE_NAMES:
    local_input_file_path = os.path.join(LOCAL_INPUT_FILES_FOLDER_PATH, input_file_name)
    s3_input_file_path = "{}/inputs/{}".format(S3_FOLDER, input_file_name)
    if not os.path.exists(local_input_file_path):
        logging.info('Download CSV file {} from S3...'.format(s3_input_file_path))
        s3.meta.client.download_file(BUCKET_NAME, s3_input_file_path, local_input_file_path)
    else:
        logging.info('CSV file {} already here...'.format(input_file_name))

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
import pyfmi
from pyfmi import load_fmu

logging.info("Load FMU model {}".format(LOCAL_FMU_PATH))
model = load_fmu(LOCAL_FMU_PATH, enable_logging=False, log_file_name=FMU_LOG_FILE)

try:
    MIN_SIM_TIME = float(app_config[MODEL]["simulation_time"]["min"])
except (KeyError, ValueError) as err:
    MIN_SIM_TIME = 0.0

try:
    MAX_SIM_TIME = float(app_config[MODEL]["simulation_time"]["max"])
except (KeyError, ValueError) as err:
    MAX_SIM_TIME = 10000.0

try:
    N_POINTS = int(app_config[MODEL]["n_points"]["default"])
except (KeyError, ValueError) as err:
    N_POINTS = 500

try:
    N_POINTS_MIN = int(app_config[MODEL]["n_points"]["min"])
except (KeyError, ValueError) as err:
    N_POINTS_MIN = 300

try:
    N_POINTS_MAX = int(app_config[MODEL]["n_points"]["max"])
except (KeyError, ValueError) as err:
    N_POINTS_MAX = 1000

DEFAULT_OPTIONS = model.simulate_options()
DEFAULT_OPTIONS = dict(ncp=N_POINTS)
if "options" in app_config[MODEL]:
    DEFAULT_OPTIONS.update(app_config[MODEL]["options"])


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

def get_handler(event, context):
    """
    This function handles HTTP GET requests.
    The function by default returns the XML model description
    file of the FMU.
    If the query parameter `?config=true` the function returns the
    JSON configuration of the lambda function and its API.
    """
    return_json_config = event["queryStringParameters"] is not None and \
        "config" in event["queryStringParameters"] and \
        event["queryStringParameters"]["config"].lower() == "true"

    if return_json_config:
        return respond(None, json.dumps(app_config))
    else:
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

    # Set the model parameters
    if "parameters" in body:
        for (par_name, par_value) in body["parameters"].iteritems():
            try:
                value_reference = model.get_variable_valueref(par_name)
                var_type = model.get_variable_data_type(par_name)

                if var_type == pyfmi.fmi.FMI_REAL:
                    model.set_real([value_reference], [float(par_value)])
                elif var_type == pyfmi.fmi.FMI_INTEGER:
                    model.set_integer([value_reference], [int(par_value)])
                elif var_type == pyfmi.fmi.FMI_BOOLEAN:
                    model.set_boolean([value_reference], [bool(par_value)])
                elif var_type == pyfmi.fmi.FMI_ENUMERATION:
                    model.set_integer([value_reference], [int(par_value)])
                elif var_type == pyfmi.fmi.FMI_STRING:
                    model.set_string([value_reference], [str(par_value)])
                else:
                    msg = "Invalid variable type for parameter {}".format(par_name)
                    return respond(ErrorMessage(STATUS_BAD_REQUEST, msg))
            except Exception, e:
                msg = "Error while setting parameter {}={}. {}".format(
                    par_name, par_value, str(e)
                )
                return respond(ErrorMessage(STATUS_BAD_REQUEST, msg))

    # @TODO: Set the states

    # Choose the input file to be used.
    # Starts by looking if the model has inputs
    input_variables_dict = model.get_model_variables(causality=0)

    if len(input_variables_dict) == 0:
        # No inputs are needed
        input_tuple = ()
    elif 'input' in body:
        # The request body contains the input data
        # use it to build the input tuple

        try:
            u_traj = np.array(body['input']['time'])
        except KeyError:
            msg = "The input parameter misses the 'time' keyword"
            return respond(ErrorMessage(INTERNAL_ERROR, msg))
        except Exception:
            msg = "Error while adding the 'time' array to the input object"
            return respond(ErrorMessage(INTERNAL_ERROR, msg))

        # Add the inputs
        input_col_names = []
        for input_var_name, _ in input_variables_dict.iteritems():
            try:
                u_traj = np.vstack((u_traj, body['input'][input_var_name]))
                input_col_names.append(input_var_name)
            except KeyError:
                msg = "The input parameter misses the {} keyword".format(input_var_name)
                return respond(ErrorMessage(INTERNAL_ERROR, msg))
            except Exception:
                msg = "Error while adding the '{}' array to the input object".format(input_var_name)
                return respond(ErrorMessage(INTERNAL_ERROR, msg))

        # Complete the creation of the input tuple
        input_tuple = (input_col_names, np.transpose(u_traj))
    else:
        # If the requests specifies the name of the files to be used
        # then use that file
        if "input_name" in body:
            fname = body["input_name"]
            if fname not in INPUT_FILE_NAMES:
                msg = "Error while selecting input name '{}'. Available options are {}".format(
                    fname, INPUT_FILE_NAMES
                )
                return respond(ErrorMessage(STATUS_NOT_FOUND, msg))
        else:
            if len(INPUT_FILE_NAMES) == 0:
                msg = "The model requires an input file but none were provided"
                return respond(ErrorMessage(INTERNAL_ERROR, msg))
            else:
                # By default pick the first input file
                fname = INPUT_FILE_NAMES[0]

        # Load the file and build the input data
        try:
            fname_path = os.path.join(LOCAL_INPUT_FILES_FOLDER_PATH, fname)
            with open(fname_path, "r") as f:
                col_names = f.readlines()[0].rstrip().split(",")

            input_file_data = np.loadtxt(
                fname_path, skiprows=1, delimiter=",",
                dtype=[(n, np.float) for n in col_names]
            )
        except Exception:
            msg = "Errors while reading input file {}".format(fname)
            return respond(ErrorMessage(INTERNAL_ERROR, msg))

        # Start by creating the 'time' column
        try:
            u_traj = input_file_data['time']
        except KeyError:
            msg = "The input file {} misses the 'time' column".format(fname)
            return respond(ErrorMessage(INTERNAL_ERROR, msg))

        # Add the inputs of the model
        input_col_names = []
        for input_var_name, _ in input_variables_dict.iteritems():
            try:
                u_traj = np.vstack((u_traj, input_file_data[input_var_name]))
                input_col_names.append(input_var_name)
            except KeyError:
                msg = "The input file {} misses column {}".format(fname, input_var_name)
                return respond(ErrorMessage(INTERNAL_ERROR, msg))

        # Complete the creation of the input tuple
        input_tuple = (input_col_names, np.transpose(u_traj))

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
        return get_handler(event, context)
    elif operation == POST:
        return post_handler(event, context)
    else:
        return respond(
            ErrorMessage(400, "HTTP method {} is not available".format(operation))
        )
