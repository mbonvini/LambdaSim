"""
"""
import os
import sys
import argparse
import json
from jinja2 import Template

CURDIR = os.path.abspath(os.path.dirname(__file__))

TEMPLATE_FILE = os.path.join(CURDIR, "templates", "swagger_api_template_cors.json")
"""
Template for the REST API using Swagger format
"""

def function_arn_to_uri(function_arn):
    """
    This function takes the ARN of a lambda function and
    returns its URI that is used by apigateway to call the
    function.

    For example
    ::

      arn:aws:lambda:us-west-2:756048602902:function:hello_world

    becomes
    ::

      arn:aws:apigateway:us-west-2:lambda:path/2015-03-31
      /functions/arn:aws:lambda:us-west-2:756048602902:function:hello_world/invocations

    :param str function_arn: The ARN of the lambda function.
    :return: The function URI
    :rtype: str
    """
    region = function_arn.split(":")[3]
    return (
        "arn:aws:apigateway:{0}:lambda:path/2015-03-31"
        "/functions/{1}/invocations"
    ).format(
        region, function_arn
    )

def render_template(lambda_function_output, destination):
    """
    Render the API swagger templates using the data contained into
    the JSON file  ``lambda_function_output`` into file
    ``destination``.

    :param str lambda_function_output: The path of the JSON file that
      contains the output of the AWS command used to create the lambda
      function.
    :param str destination: The path of the file where the swagger API
      template is rendered.
    """
    if not os.path.exists(lambda_function_output):
        msg = "The input file {0} does not exist".format(
            lambda_function_output
        )
        sys.exit(msg)
    elif not lambda_function_output.endswith("json"):
        msg = "The input file {} must be a valid JSON".format(
            lambda_function_output
        )
        sys.exit(msg)
    elif not destination.endswith("json"):
        msg = "The destination file {} must be a valid JSON".format(
            destination
        )
        sys.exit(msg)

    with open(lambda_function_output, "r") as fi:

        lambda_descr = json.loads(fi.read())
        function_name = lambda_descr["FunctionName"]
        function_arn = lambda_descr["FunctionArn"]
        function_uri = function_arn_to_uri(function_arn)

        with open(TEMPLATE_FILE, "r") as ft:
            template = Template(ft.read())

        with open(destination, "w+") as fo:
            fo.write(
                template.render(
                    function_name=function_name,
                    function_uri=function_uri
                )
            )

if __name__ == "__main__":

    description = (
        "Command line utility that generates swagger API templates. "
        "The program takes two inputs: "
        "(1) The path of the JSON file that contains the response of the"
        " AWS when the lambda function is created."
        "(2) The path of the JSON file that will contain the description of"
        " the API using the swagger format."
    )

    parser = argparse.ArgumentParser(
        prog="generate_api_template",
        description=description
    )

    parser.add_argument(
        'lambda_function', metavar='lambda_function', type=str,
        help=(
            ("The path of the JSON file that contains the response "
             "of the AWS API")
        )
    )

    parser.add_argument(
        'dest', metavar='dest', type=str,
        help="The path of the output file"
    )

    args = parser.parse_args()

    if args.lambda_function and args.dest:
        render_template(args.lambda_function, args.dest)
    else:
        parser.print_help()