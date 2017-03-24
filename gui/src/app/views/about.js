import React from 'react';
import log from 'loglevel';

const containerStyle = {
  marginTop: 20,
  marginLeft: 10,
  marginRight: 10,
  minHeight: 400
};

class AboutView extends React.Component {

  constructor(props) {
    super(props);
  }


  render() {
    return (
      <div className="row" style={containerStyle}>
        <div className="col s10 offset-s1 m8 offset-m2">
          <h4>About</h4>
          <p>
            λ-Sim is a tool that converts simulation models into REST APIs.
            The figure below gives an idea of what the tool does for you
          </p>
          <ol>
            <li>
              It takes a simulation model exported from Matlab or a Modelica
              tool and a JSON configuration file,
            </li>
            <li>
              it automatically generates a lambda function that simulates the model
              and it's exposed via a REST API that is available to any application
              that talks HTTP.
            </li>
          </ol>
          <div className="col s10 offset-s1">
            <img className="responsive-img"
              src="https://github.com/mbonvini/LambdaSim/raw/master/images/diagram.png" />
          </div>
          <div className="clearfix" />
          <p>
            With λ-Sim you can build a MaaS (Model as a Service) application where
            people can access your model, run simulations and visualize the results.
          </p>
          <p>
            λ-Sim is built on top of AWS <a href="https://aws.amazon.com/lambda/">Lambda</a>
            <a href="https://aws.amazon.com/api-gateway/">API-gateway</a>,
            <a href="https://aws.amazon.com/s3/">S3</a>, and 
            <a href="https://aws.amazon.com/cloudwatch/">Cloudwatch</a>. 
            These AWS services allows you to build an application that automatically manages
            security updates, handle incoming traffic and scale as needed, monitor performances,
            and if necessary applies restrictions and limits to users.
            And for all of this there is no charge when your code is not running.
          </p>
        </div>
      </div>
    )
  }
}

export default AboutView;