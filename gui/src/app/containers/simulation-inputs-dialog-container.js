import React from 'react';
import { connect } from 'react-redux';
import SimulationInputsDialog from '../components/simulation-inputs-dialog';
import log from 'loglevel';
import store from '../store';

class SimulationInputsDialogContainer extends React.Component {

  constructor (props) {
    super(props);
  }

  componentDidMount () {
  }

  render() {
    return (
      <SimulationInputsDialog
        config={this.props.config}
        {...this.props} />
    );
  }

}

const mapStateToProps = function(store) {
  return {
    config: store.configDefinition.config
  };
};

export default connect(mapStateToProps)(SimulationInputsDialogContainer);