import React from 'react';
import { Link } from 'react-router';
import log from 'loglevel';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { Field, reduxForm } from 'redux-form';
import store from '../store';

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
  // https://API_ID.execute-api.AWS_REGION.amazonaws.com/prod/FUNCTION_NAME
  if (values.url && !/^https\:\/\/[A-Za-z0-9]{10,11}\.execute-api\.[A-Za-z0-9\-]+\.amazonaws\.com\/prod\/[a-zA-Z_\-0-9]+$/i.test(values.url)) {
    errors.url = 'Invalid API URL';
  }
  return errors;
}

const renderTextField = ({ input, label, hintText, meta: { touched, error }, ...custom }) => (
  <TextField hintText={hintText}
    floatingLabelText={label}
    errorText={touched && error}
    {...input}
    {...custom}
  />
)

const fieldStyle = {
  width: '100%'
}

/*
let SelectApiForm = props => {
  const { handleSubmit, pristine, reset, submitting, invalid, close } = props;
  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      <div>
        <Field name="url" component={renderTextField}
         style={fieldStyle} label="Enter URL here"
         hintText="https://123456789a.execute-api.us-west-2.amazonaws.com/prod/hello_world"
         />
      </div>
      <div>
        <RaisedButton label="RESET"
          type="button" onClick={reset}
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
*/

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
      log.info("INIT...")
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
          <RaisedButton label="RESET"
            type="button" onClick={reset}
            style={btnStyle} secondary={true}/>
          <RaisedButton label="CLEAR"
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
})(SelectApiForm)

/*
export default reduxForm({
  form: 'SelectApiForm',
  initialValues: store.getState().apiSettings,
  validate
})(SelectApiForm);
*/