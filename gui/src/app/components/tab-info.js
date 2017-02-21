import React from 'react';
import log from 'loglevel';
import store from '../store';

class TabInfo extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="row">
        <div className="col s5">
          <p>
            This web app allows you to interact with an API created
            by <b>λ-Sim</b>.
          </p>
          <ol>
            <li>Start by selecting the API,</li>
            <li>browse the model variables and parameters,</li>
            <li>run simulations and visualize the data</li>
          </ol>
        </div>
        <div className="col s7" style={{marginTop:20}}>
          <img className="responsive-img"
          src="https://github.com/mbonvini/LambdaSim/raw/master/images/diagram.png" />
        </div>
      </div>
    );
  }

}

export default TabInfo;