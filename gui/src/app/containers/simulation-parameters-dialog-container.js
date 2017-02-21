import React from 'react';
import { connect } from 'react-redux';
import SimulationParametersDialog from '../components/simulation-parameters-dialog';
import log from 'loglevel';
import store from '../store';

class SimulationParametersDialogContainer extends React.Component {

  constructor (props) {
    super(props);
  }

  componentDidMount () {
  }

  render() {
    return (
      <SimulationParametersDialog
      modelDescription={this.props.modelDescription}
      modelParameters={this.props.modelPparameters}
      {...this.props} />
    );
  }

}

const mapStateToProps = function(store) {
  return {
    modelDescription: store.modelDescription.description,
    modelParameters: store.modelParameters
  };
};

export default connect(mapStateToProps)(SimulationParametersDialogContainer);