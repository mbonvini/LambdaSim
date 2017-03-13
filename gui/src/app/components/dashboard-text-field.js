import log from 'loglevel';
import React from 'react';
import TextField from 'material-ui/TextField';
import { updateModelParameter } from '../actions/model-parameters-actions';
import store from '../store';

class DashboardTextField extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: String(this.props.widget.param.default),
    };
    this.handleChange = this.handleChange.bind(this);
    this.setModelParameter = this.setModelParameter.bind(this);
  }

  componentDidMount(){
    this.setModelParameter(this.state.value);
  }

  handleChange(event, newVal){
    this.setState({value: newVal});
    this.setModelParameter(newVal);
  }

  setModelParameter(newVal){
    const var_name = this.props.widget.param.name;
    store.dispatch(updateModelParameter(
      var_name, null, newVal)
    );
  }

  render() {
    return (
      <TextField
        value={this.state.value}
        floatingLabelText={this.props.widget.name}
        floatingLabelFixed={true}
        onChange={this.handleChange}
      />
    );
  }
}

export default DashboardTextField;
