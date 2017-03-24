import React from 'react';
import { Link } from 'react-router';
import store from '../store';
import log from 'loglevel';
import { Tabs, Tab } from 'material-ui/Tabs';
import TabSimulationContainer from '../containers/tab-simulation-container';
import TabDashboardContainer from '../containers/tab-dashboard-container';
import TabModelDescriptionContainer from '../containers/tab-model-description-container';
import TabInfoContainer from '../containers/tab-info-container';
import Snackbar from 'material-ui/Snackbar';

import { resetErrorMessage } from '../actions/error-message-actions';
import { selectTab } from '../actions/home-tabs-actions';
import { setApiSettingsUrl } from '../actions/api-settings-actions';
import { getModelDescription, getModelConfig, getModelDashboard, getReadme } from '../api/lambda-sim-api';

const containerStyle = {
  marginTop: 20,
  marginLeft: 10,
  marginRight: 10,
  minHeight: 400
};

class HomeView extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount(){
     if(Object.assign({}, self.props.location.query).hasOwnProperty('api')){
       const url = self.props.location.query.api;
       store.dispatch(setApiSettingsUrl(url));
       getModelDescription();
       getModelConfig();
       getModelDashboard();
       getReadme(); 
     }
  }

  render() {
    self = this;
    return (
      <div className="row" style={containerStyle}>
        <div className="col s12 ">
          <Tabs
            value={this.props.homeTabs.tabSelected}
            onChange={(value) => {store.dispatch(selectTab(value));}}>
            <Tab label="Info" value="info" >
              <TabInfoContainer />
            </Tab>
            <Tab label="Dashboard" value="dashboard">
              <TabDashboardContainer />
            </Tab>
            <Tab label="Model description" value="model_description" >
              <TabModelDescriptionContainer />
            </Tab>
            <Tab label="Simulate" value="simulate">
              <TabSimulationContainer />
            </Tab>
          </Tabs>
        </div>
        <Snackbar
          open={this.props.error.message ? true : false}
          message={this.props.error.message || '' }
          autoHideDuration={10000}
          style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
          bodyStyle={{ pointerEvents: 'initial', maxWidth: 'none' }}
          onRequestClose={(reason) => {store.dispatch(resetErrorMessage());}}
        />
      </div >
    )
  }
}

export default HomeView;