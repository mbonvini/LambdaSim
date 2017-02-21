import React from 'react';
import { connect } from 'react-redux';
import Navbar from '../components/navbar';
import log from 'loglevel';

const NavbarContainer = React.createClass({

  render: function() {
    return (
      <Navbar apiSettings={this.props.apiSettings} loading={this.props.loading}/>
    );
  }

});

const mapStateToProps = function(store) {
  return {
    apiSettings: store.apiSettings,
    loading: store.loading
  };
};

export default connect(mapStateToProps)(NavbarContainer);