import React from 'react';
import { connect } from 'react-redux';
import HomeView from '../views/home';
import log from 'loglevel';
import store from '../store';

const HomeContainer = React.createClass({

  render: function() {
    return (
      <HomeView error={this.props.error} homeTabs={this.props.homeTabs} {...this.props}/>
    );
  }

});

const mapStateToProps = function(store) {
  return {
    error: store.error,
    homeTabs: store.homeTabs
  };
};

export default connect(mapStateToProps)(HomeContainer);