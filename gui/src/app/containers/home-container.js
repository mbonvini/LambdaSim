import React from 'react';
import { connect } from 'react-redux';
import HomeView from '../views/home';
import log from 'loglevel';
import store from '../store';

const HomeContainer = React.createClass({

  componentDidMount: function() {
  },

  render: function() {
    return (
      <HomeView model={this.props.model} />
    );
  }

});

const mapStateToProps = function(store) {
  return {
    model: store.model
  };
};

export default connect(mapStateToProps)(HomeContainer);