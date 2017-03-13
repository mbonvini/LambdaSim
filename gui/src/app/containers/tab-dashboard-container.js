import React from 'react';
import { connect } from 'react-redux';
import TabDashboard from '../components/tab-dashboard';
import log from 'loglevel';
import store from '../store';

class TabDashboardContainer extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TabDashboard
        modelDescription={this.props.modelDescription}
        modelSimulation={this.props.modelSimulation}
        plotVariables={this.props.plotVariables}
        dashboard={this.props.dashboard}
        inputFileName={this.props.inputFileName}
        {...this.props}
      />
    );
  }

}

const mapStateToProps = function(store) {
  return {
    modelDescription: store.modelDescription.description,
    modelSimulation: store.modelSimulation,
    plotVariables: store.plotVariables.plotVariables,
    modelParameters: store.modelParameters,
    dashboard: store.dashboardDefinition.dashboard,
    inputFileName: store.modelInput.fileName
  };
};

export default connect(mapStateToProps)(TabDashboardContainer);