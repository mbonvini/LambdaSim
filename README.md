# λ-Sim
Convert simulation models to REST APIs


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

```
[default]
aws_access_key_id = <access_key_id>
aws_secret_access_key = <access_key_secret>
region = <your_aws_region>

[<your_access_key_name>]
aws_access_key_id = <access_key_id>
aws_secret_access_key = <access_key_secret>
region = <your_aws_region>
```

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

```
make install
```

to install all the dependencies required to

- deploy the model to S3,
- create and configure the lambda function,
- create and configure the API gateway that exposes
the REST API

This command alos created an S3 bucket where all
the FMU will be stored.

## Usage

0. prepare your FMU in a folder and put the config.json file in it
1. edit the config file
2. copy the FMU to the S3 bucket (unique name)
3. deploy the application as lambda function that is configured
with your FMU (this also create a specific IAM rule for this lambda
function: S3 + logs)
4. create API endpoint, integrate it with the lambda function,
enable access (let lambda be called by API gateway), deploy a version
5. test it

