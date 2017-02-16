import React from 'react';
import { connect } from 'react-redux';
import Navbar from '../components/navbar';
import log from 'loglevel';

const NavbarContainer = React.createClass({

  componentDidMount: function() {
  },

  render: function() {
    return (
      <Navbar apiSettings={this.props.apiSettings} />
    );
  }

});

const mapStateToProps = function(store) {
  return {
    apiSettings: store.apiSettings,
  };
};

export default connect(mapStateToProps)(NavbarContainer);