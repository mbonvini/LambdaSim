import React from 'react';
import { connect } from 'react-redux';
import TabSimulation from '../components/tab-simulation';
import log from 'loglevel';
import store from '../store';

class TabSimulationContainer extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    return (
      <TabSimulation model={this.props.model} {...this.props} />
    );
  }

}

const mapStateToProps = function(store) {
  return {
    model: store.model
  };
};

export default connect(mapStateToProps)(TabSimulationContainer);