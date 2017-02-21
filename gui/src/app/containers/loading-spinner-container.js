import React from 'react';
import { connect } from 'react-redux';
import LoadingSpinner from '../components/loading-spinner';
import log from 'loglevel';

const LoadingSpinnerContainer = React.createClass({

  render: function() {
    return (
      <LoadingSpinner loading={this.props.loading}/>
    );
  }

});

const mapStateToProps = function(store) {
  return {
    loading: store.loading
  };
};

export default connect(mapStateToProps)(LoadingSpinnerContainer);