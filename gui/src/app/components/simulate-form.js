import React from 'react';
import log from 'loglevel';
import RaisedButton from 'material-ui/RaisedButton';
import { Field, SelectField, reduxForm } from 'redux-form';
import store from '../store';
import { renderTextField, renderSelectField } from './constants';
import SimulationInputsDialogContainer from '../containers/simulation-inputs-dialog-container';

const btnStyle = {
  marginTop: 0,
  marginLeft: 10,
  marginRight: 10
};

const validate = values => {
  const errors = {};
  const requiredFields = ['startTime', 'finalTime'];
  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = 'Required'
    }
  })
  if (isNaN(+values.startTime)) {
    errors.startTime = 'Invalid start time';
  }
  if (isNaN(+values.finalTime)) {
    errors.finalTime = 'Invalid stop time';
  }
  if (+values.finalTime <= +values.startTime){
    errors.finalTime = 'Stop time must be after start time';
  }
  return errors;
}


class SimulateForm extends React.Component {

  constructor(props) {
    super(props);
  }

  render = () => {
    const {
      handleSubmit, pristine, reset, submitting,
      invalid, close, clear, openSettingsDialog,
      openParametersDialog
    } = this.props;
    return (
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="valign-wrapper" style={{height: '100px'}}>
          <Field name="startTime" component={renderTextField}
            floatingLabelText="Start time"
            hintText="Enter start time in seconds"
            value={store.getState().modelSimulation.startTime}
            style={{ marginTop:0, marginRight: 10, width: 200 }}
          />
          <Field name="finalTime" component={renderTextField}
            floatingLabelText="Stop time"
            hintText="Enter stop time in seconds"
            value={store.getState().modelSimulation.finalTime}
            style={{ marginTop:0, marginRight: 10, width: 200 }}
          />
          <RaisedButton
            label='Simulate' type="submit" value="submit"
            disabled={invalid || pristine} secondary={true}
            style={btnStyle}
          />
          <RaisedButton label='Settings' secondary={true}
          onClick={openSettingsDialog}
          disabled={true}
          style={btnStyle}/>
          { this.props.showParametersButton &&
          <RaisedButton label='Parameters' secondary={true}
          onClick={openParametersDialog}
          style={btnStyle}/>
          }

          <SimulationInputsDialogContainer />
        </div>
      </form>
    )
  }
}

export default reduxForm({
  form: 'SimulateForm',
  validate
})(SimulateForm);