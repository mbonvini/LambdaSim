import React from 'react';
import { connect } from 'react-redux';
import TabModelDescription from '../components/tab-model-description';
import log from 'loglevel';
import store from '../store';

class TabModelDescriptionContainer extends React.Component {

  constructor (props) {
    super(props);
  }

  componentDidMount () {
  }

  render() {
    return (
      <TabModelDescription
      modelDescription={this.props.modelDescription}
      filterStr={this.props.filterStr}
      filterParameters={this.props.filterParameters}
      filterConstants={this.props.filterConstants}
      filterInputs={this.props.filterInputs}
      filterOutputs={this.props.filterOutputs}
      filterContinuous={this.props.filterContinuous}
      {...this.props} />
    );
  }

}

const mapStateToProps = function(store) {
  return {
    modelDescription: store.model.description,
    filterStr: store.model.filterStr,
    filterParameters: store.model.filterParameters,
    filterConstants: store.model.filterConstants,
    filterInputs: store.model.filterInputs,
    filterOutputs: store.model.filterOutputs,
    filterContinuous: store.model.filterContinuous
  };
};

export default connect(mapStateToProps)(TabModelDescriptionContainer);