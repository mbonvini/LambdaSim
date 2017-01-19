# λ-Sim
Convert simulation models to REST APIs


## Disclaimer

You may encounter expenses when using AWS services. By default the tool
creates a private API that only you can access using a secret API key.

> If you decide to make your model available to the public your account will
> be charged for the use of AWS services and resources required to serve the
> requests. I suggest you to carefully read and review AWS charges and policies.
> **The author/s of this project are not responsible in any way for the use of
> the AWS services. USE THIS PROJECT AT YOUR OWN RISK!

## Prerequisites

This tool requires access to AWS services through its REST API.
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

## Installation

The repository contains a `Makefile`, run

```
make install
```

to install all the dependencies required to

- deploy the model,
- create the lambda function,
- create the API gateway

## Usage

