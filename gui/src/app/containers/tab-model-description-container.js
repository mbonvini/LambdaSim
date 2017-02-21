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
      filterHidden={this.props.filterHidden}
      {...this.props} />
    );
  }

}

const mapStateToProps = function(store) {
  return {
    modelDescription: store.modelDescription.description,
    filterStr: store.modelDescription.filterStr,
    filterParameters: store.modelDescription.filterParameters,
    filterConstants: store.modelDescription.filterConstants,
    filterInputs: store.modelDescription.filterInputs,
    filterOutputs: store.modelDescription.filterOutputs,
    filterContinuous: store.modelDescription.filterContinuous,
    filterHidden: store.modelDescription.filterHidden
  };
};

export default connect(mapStateToProps)(TabModelDescriptionContainer);