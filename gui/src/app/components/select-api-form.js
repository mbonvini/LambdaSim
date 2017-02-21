import React from 'react';
import { Link } from 'react-router';
import log from 'loglevel';
import RaisedButton from 'material-ui/RaisedButton';
import { Field, reduxForm } from 'redux-form';
import store from '../store';
import { renderTextField } from './constants';

const btnStyle = {
  marginTop: 10,
  marginBottom: 10,
  marginRight: 10
};

const validate = values => {
  const errors = {};
  const requiredFields = [ 'url' ];
  requiredFields.forEach(field => {
    if (!values[ field ]) {
      errors[ field ] = 'Required'
    }
  })

  if (values.url && !/^https\:\/\/[A-Za-z0-9]{10,11}\.execute-api\.[A-Za-z0-9\-]+\.amazonaws\.com\/prod\/[a-zA-Z_\-0-9]+$/i.test(values.url)) {
    errors.url = 'Invalid API URL';
  }
  return errors;
}

const fieldStyle = {
  width: '100%'
}

class SelectApiForm extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
    this.handleInitialize();
  }

  handleInitialize = () => {
    const initData = {
      url: store.getState().apiSettings.url
    };
    if(initData.url !== null){
      this.props.initialize(initData);
    }else{
      this.props.reset()
    }
  }

  render = () => {
    const { handleSubmit, pristine, reset, submitting, invalid, close, clear } = this.props;
    return (
      <form onSubmit={handleSubmit} autoComplete="off">
        <div>
          <Field name="url" component={renderTextField}
          style={fieldStyle} label="Enter URL here"
          hintText="https://123456789a.execute-api.us-west-2.amazonaws.com/prod/hello_world"
          />
        </div>
        <div>
          <RaisedButton label="CLEAR ALL"
            type="button" onClick={clear}
            style={btnStyle} secondary={true}/>
          <RaisedButton label="CANCEL"
            onClick={close}
            style={btnStyle} secondary={true}/>
          <RaisedButton label="SUBMIT" type="submit"
            value="Submit" disabled={invalid || pristine}
            style={btnStyle} secondary={true}/>
        </div>
      </form>
    )
  }
}

export default reduxForm({
  form: 'SelectApiForm',
  validate
})(SelectApiForm);