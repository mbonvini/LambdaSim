import React from 'react';
import { connect } from 'react-redux';
import Plot from '../components/plot';
import log from 'loglevel';
import store from '../store';

class PlotContainer extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Plot
        modelSimulation={this.props.modelSimulation}
        plotVariables={this.props.plotVariables}
        {...this.props}
      />
    );
  }

}

const mapStateToProps = function(store) {
  return {
    modelSimulation: store.modelSimulation,
    plotVariables: store.plotVariables.plotVariables
  };
};

export default connect(mapStateToProps)(PlotContainer);