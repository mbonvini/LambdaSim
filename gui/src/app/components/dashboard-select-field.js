import log from 'loglevel';
import React from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { updateModelParameter } from '../actions/model-parameters-actions';
import store from '../store';

class DashboardSelectField extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: this.props.widget.options[0].params,
    };
    this.handleChange = this.handleChange.bind(this);
    this.setModelParameter = this.setModelParameter.bind(this);
  }

  componentDidMount(){
    this.setModelParameter();
  }

  handleChange(event, index, val){
    this.setState({value: val});
    this.setModelParameter();
  }

  setModelParameter(){
    for(let var_name in this.state.value){
      store.dispatch(updateModelParameter(
        var_name, null, String(this.state.value[var_name])
      ));
    }
  }

  render() {
    return (
      <SelectField
        key={this.props.uniqueKey}
        value={this.state.value}
        floatingLabelText={this.props.widget.name}
        onChange={this.handleChange}>
        {this.props.widget.options.map(
          (opt, idx) =>
            <MenuItem key={this.props.uniqueKey+"_option_"+idx}
              value={opt.params}
              primaryText={opt.display_name} />
          )
        }
      </SelectField>
    );
  }
}

export default DashboardSelectField;
