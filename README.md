# λ-Sim

λ-Sim is a tool that converts simulation models into REST APIs.
The figure below gives an idea of what the tool does for you

1. It takes a simulation model exported from Matlab or a Modelica
tool and a JSON configuration file,
3. It automatically generates a Lambda function that includes
a complete REST API to run the simulation model.

![λ-Sim Schematic diagram](https://github.com/mbonvini/LambdaSim/raw/master/images/diagram.png)

With λ-Sim you can build a MaaS (Model as a Service) application where
people can access your model, run simulations and visualize results.

λ-Sim is built on top of AWS [Lambda](https://aws.amazon.com/lambda/),
[API-gateway](https://aws.amazon.com/api-gateway/), [S3](https://aws.amazon.com/s3/)
and [Cloudwatch](https://aws.amazon.com/cloudwatch/).
These AWS services allows you to build an application that automatically manages
security updates, scale as needed based on the incoming traffic, monitor performances,
and if necessary apply restrictions to users.
And no charges when your code is not running.

λ-Sim has a GUI available at [https://mbonvini.github.io/LambdaSim/](https://mbonvini.github.io/LambdaSim/).
Here you can load APIs created with λ-Sim, simulate the models and visualize
the results.

Have a look at these two examples created with λ-Sim

- [Hello World](https://mbonvini.github.io/LambdaSim/?api=https://09r1151hxj.execute-api.us-west-2.amazonaws.com/prod/hello_world)
- [Building Energy Model](https://mbonvini.github.io/LambdaSim/?api=https://0m43gmgny4.execute-api.us-west-1.amazonaws.com/prod/simple_building)

For information and documentation check out the [wiki](https://github.com/mbonvini/LambdaSim/wiki).

For comments and questions you can create an issue, contributions are
welcome.

## Aknowledgemnts

I want to thanks [Modelon](http://www.modelon.com) for making available their tools,
without them this project wouldn't exist.

## Disclaimer

λ-Sim allows to create a REST API implemented on top of
Amazon Web Services (AWS) such as
- lambda
- apigateway,
- S3, and
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
