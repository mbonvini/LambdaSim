import axios from 'axios';
import React from 'react';
import log from 'loglevel';
import ReactMarkdown from 'react-markdown';

import store from '../store';
import { setLoadingMessage, resetLoadingMessage } from '../actions/loading-actions';
import { setErrorMessage } from '../actions/error-message-actions';

const containerStyle = {
  marginTop: 20,
  marginLeft: 10,
  marginRight: 10,
  minHeight: 400
};

const API_DOCS_URL = "https://raw.githubusercontent.com/wiki/mbonvini/LambdaSim/LambdaSim-API.md";

class ApiDocs extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      content: ''
    };
  }

  componentWillMount(){
    store.dispatch(setLoadingMessage('Load API Docs'));
    const self = this;
    return axios.get(API_DOCS_URL)
      .then((response) => {
        self.setState({content: response.data});
        store.dispatch(resetLoadingMessage());
        return response;
      })
      .catch((error) => {
        const msg = 'Errors while getting the API Docs. '+
          'Please make your internet connection is working';
        store.dispatch(setErrorMessage(msg));
        store.dispatch(resetLoadingMessage());
        log.info(error);
      });
  }

  render() {
    return (
      <div className="row" style={containerStyle}>
        <div className="col s10 offset-s1 m8 offset-m2">
          <ReactMarkdown source={this.state.content} />
        </div>
      </div>
    )
  }
}

export default ApiDocs;