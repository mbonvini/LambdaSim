import React from 'react';
import { connect } from 'react-redux';
import PlotSelectionMenu from '../components/plot-selection-menu';
import log from 'loglevel';
import store from '../store';

const PlotSelectionMenuContainer = React.createClass({

  render: function() {
    return (
      <PlotSelectionMenu plotVariables={this.props.plotVariables}
      filterString={this.props.filterString} />
    );
  }

});

const mapStateToProps = function(store) {
  return {
    plotVariables: store.plotVariables.plotVariables,
    filterString: store.plotVariables.filterString
  };
};

export default connect(mapStateToProps)(PlotSelectionMenuContainer);