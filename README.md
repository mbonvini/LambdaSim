# λ-Sim
Convert simulation models to REST APIs

![λ-Sim Schematic diagram](https://github.com/mbonvini/LambdaSim/raw/master/images/diagram.png)

## Disclaimer

λ-Sim allows to create a REST API implemented on top of
Amazon Web Services (AWS) such as
- lambda
- apigateway,
- S3,
- cloudwatch

**YOU MAY ENCOUNTER EXPENSES WHEN USING AWS SERVICE**

> By default λ-Sim makes your model open to the public, anyone will be able to
> access your model and therefore your account will
> be charged for the use of AWS services and resources required to serve the
> requests. I suggest you to carefully read and review AWS charges and policies.
> **The author/s of this project are not responsible in any way for the use and
> charges of the AWS services on your and any third-party account.
> USE THIS PROJECT AT YOUR OWN RISK!

If you're interested in limiting access to the REST API please have a
look at the AWS documentation
[apigateway-control-access-to-api](http://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-to-api.html)

## Prerequisites

### AWS account

λ-Sim requires access to AWS services through its API.
To access AWS services via its API you need an access key.
Look [here](https://aws.amazon.com/developers/access-keys/)
to see how to get one.

After following the guide, you should have a hidden folder named
`.aws` in your home directory. Such a folder contains a file called
`credentials`. The contents of `~/.aws/credentials` should look
like the following

    [default]
    aws_access_key_id = <access_key_id>
    aws_secret_access_key = <access_key_secret>
    region = <your_aws_region>

    [<your_access_key_name>]
    aws_access_key_id = <access_key_id>
    aws_secret_access_key = <access_key_secret>
    region = <your_aws_region>

The AWS command line tool and AWS libraries like boto3 will automatically
use the information stored in this configuration file.

In order to use λ-Sim, the AWS account requires the following permissions
- `s3:FullAccess`,
- `lambda:FullAccess`,
- `iam:CreateRole`,
- `apigateway:FullAccess`


### jq

λ-Sim uses [jq](https://stedolan.github.io/jq/) to manipulate and
parse JSON documents. If you don't have jq installed in your system
please have a kook [here](https://stedolan.github.io/jq/download/)
for more info.

### Python and virtualenv

λ-Sim uses some Python packages and tool to interact with AWS service.
The λ-Sim dependencies are automatically installed in a virtual environment.
If you don't have [Python](https://www.python.org/) and [virtualenv](https://virtualenv.pypa.io/en/latest/)
you have to install them before using λ-Sim.

## Installation

The repository contains a `Makefile`, run

    make install

to install all the dependencies required to

- deploy the model to S3,
- create and configure the lambda function,
- create and configure the API gateway that exposes
the REST API

This command alos created an S3 bucket where all
the FMU will be stored.

## Usage

This section describes how to convert a simulation model exported
as a Functional Mockup Unit (FMU) to an AWS lambda function and
expose it through a REST API.

### Setup APP folder

First get the FMU and put it in a folder in `./apps/<YOUR_APP>`.
If you don't have an FMU you can use one of the projects already in the
`./apps` folder, for example `./apps/hello_world`.

Second, you need to add a JSON file called `config.json` in the
application folder `./apps/<YOUR_APP>`.
The result is `./apps/<YOUR_APP>/config.json`.

You can use `./apps/config_template.json` as template for the configuration
file. You can also have a look at `./apps/hello_world/config.json` to have
an idea of how this file should look like.

NOTE: The `config.json` file is packaged with the application when the
the lambda function is created and is available at runtime.

### Create the lambda function

To create the AWS lamnda function that runs simulation of your FMU
run this command

    make create_function APP_DIR=./apps/<YOUR_APP>

where `APP_DIR` is the path of the application folder (the one that contains
the `*.fmu` and the `config.json` file).

This command performs the following actions

1. creates an S3 bucket that will store your FMUs,
2. copies the FMU from your `APP_DIR` folder to S3,
3. creates IAM roles that allows the lambda function to read
data from S3 and write log files in cloudwatch,
4. creates the lambda function.

All the above steps are done in accordance with the settings specified in
the file `./apps/<YOUR_APP>/config.json`.

At this point the lambda function exists and you can test it using the AWS
console. At this point the function is not yet open to the public.

### Expose the function to the public through a REST API

To create a REST API endpoint that exposes the lambda function
run this command

    make expose_function APP_DIR=./apps/<YOUR_APP>

This command performs the following actions

1. creates the REST API endpoint and its resources using apigateway,
2. configures the lambda function such that it can be
executed from apigateway,
3. deploys the API and makes it available to the public.


Once the API has been deployed the command

    make get_url APP_DIR=./apps/<YOUR_APP>

returns the public URL of the REST API endpoint. The URL has the following
structure 

    https://<api_id>.execute-api.<region>.amazonaws.com/prod/<function_name>

Once the API is public you can test it by making HTTP requests to it, for example

    curl -X GET "https://<api_id>.execute-api.<region>.amazonaws.com/prod/<function_name>"

returns the XML model description file that is part of the FMU. The command

    curl -X POST "https://<api_id>.execute-api.<region>.amazonaws.com/prod/<function_name>"

runs the default simulation and returns the result data as a JSON object.

## Questions

### I have different IAM profiles, can I specify which one using?

Your AWS configuration file `~/.aws/credentials`
can have multiple profiles, for example one for your organization,
one personal, etc.

    [default]
    aws_access_key_id = <access_key_id>
    aws_secret_access_key = <access_key_secret>
    region = <your_aws_region>

    [<your_access_key_name>]
    aws_access_key_id = <access_key_id>
    aws_secret_access_key = <access_key_secret>
    region = <your_aws_region>

The `Makefile` accepts the parameter `PROFILE`, by default its value is
`PROFILE=default`. If you want you can select a different profile like

    make <command> APP_DIR=./apps/<YOUR_APP> PROFILE=<your_access_key_name>

### Why is the FMU downloaded from S3?

When you create a lambda function on AWS you have to submit
a zip file that contains the source code and all the dependencies
required by your function. This zip file must be smaller than 50MB!

Trying to compress all the Python dependencies needed to simulate
an FMU entails packaging PyFMI, Assimulo, Numpy, Scipy, Sundials, FMILib, etc.
This is quite a challenging task. In the current implementation the zip file
without the source code of the lambda function and its JSON configuration
file is 49.77MB, that doesn't leave space much space for any real-world
FMU model.

### Does downloading the FMU slow down the lambda function?

AWS keeps the environment where the code is executed "warm". What this mean
is that the firt time you make a request to the API it will take a bit of time
because it has to download the FMU and setup other things. The following requests
don't trigger the download and reuse the same environment.

### Can I protect the API from the public?

Yes you can, you can even let people pay to use your API and simulate your model!
Generate access tokens that have limits on the requests per month/day and the
number of requests per second.
Have a look at the following links in case you are more interested.

- [create an API](http://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-create-api.html)
- [access control](http://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-to-api.html)
- [sell your API](http://docs.aws.amazon.com/apigateway/latest/developerguide/sell-api-as-saas-on-aws-marketplace.html)

### More questions on lambda functions and apigateway?

- https://aws.amazon.com/lambda/faqs/
- https://aws.amazon.com/api-gateway/faqs/
