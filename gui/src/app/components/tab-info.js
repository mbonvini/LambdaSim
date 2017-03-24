import React from 'react';
import log from 'loglevel';
import store from '../store';
import ReactMarkdown from 'react-markdown';

const defaultContent = (
  <div>
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

class TabInfo extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    let content;
    if(this.props.readme.content !== ''){
      content = <ReactMarkdown source={this.props.readme.content} />;
    }else{
      content = defaultContent;
    }

    return (
      <div className="row">
        {content}
      </div>
    );
  }

}

export default TabInfo;