from __future__ import print_function
import os
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
STATUS_NOT_FOUND = "404"
INTERNAL_ERROR = "500"

# name of env variables
LOG_LEVEL = "LS_LOG_LEVEL"
S3_FMU_BUCKET_NAME = "S3_FMU_BUCKET_NAME"

# event keywords
HTTP_METHOD = "httpMethod"

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
    except Exception, e:
        print(str(e))

logging.basicConfig(
    level=LEVEL, format=LOG_FORMAT, datefmt=LOG_DATE_FORMAT
)

# Load the config JSON file that is part of the ZIP.
# This file contains info about the model, simulation parameters
# and other settings.
logging.info("Open config file {}".format(CONFIG_FILE))
app_config = json.loads(open(CONFIG_FILE).read())

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


class ErrorMessage(object):
    """Class representing an HTTP error with code and message"""

    def __init__(self, code=None, msg=""):
        """Init Error message object"""
        self.code = code
        self.message = msg 


def respond(err, res="", content_type=APPLICATION_JSON):
    """
    This function builds and returns an HTTP response
    object.
    """
    return {
        'statusCode': STATUS_OK if err is None else err.code,
        'body': err.message if err else res,
        'headers': {
            'Content-Type': content_type,
        },
    }

def get_handler():
    """
    This function handles HTTP GET requests.
    """
    with open(LOCAL_FMU_DESCRIPTION_FILE, "r") as xml_file:
        return respond(None, xml_file.read(), content_type=APPLICATION_XML)
    return respond(
        ErrorMessage(404, "Model description file not found")
    )

def post_handler(event, context):
    """
    This function handles HTTP POST requests.
    """
    return respond(None, json.dumps({}))

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
