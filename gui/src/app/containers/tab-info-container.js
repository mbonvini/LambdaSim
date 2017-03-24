import React from 'react';
import { connect } from 'react-redux';
import TabInfo from '../components/tab-info';
import log from 'loglevel';
import store from '../store';

class TabInfoContainer extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TabInfo
        readme={this.props.readme}
        {...this.props}
      />
    );
  }

}

const mapStateToProps = function(store) {
  return {
    readme: store.readme
  };
};

export default connect(mapStateToProps)(TabInfoContainer);