import React from 'react';
import { connect } from 'react-redux';
import DashboardPlot from '../components/dashboard-plot';
import log from 'loglevel';
import store from '../store';

class DashboardPlotContainer extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <DashboardPlot
        modelSimulation={this.props.modelSimulation}
        {...this.props}
      />
    );
  }

}

const mapStateToProps = function(store) {
  return {
    modelSimulation: store.modelSimulation
  };
};

export default connect(mapStateToProps)(DashboardPlotContainer);