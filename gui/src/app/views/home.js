import React from 'react';
import { Link } from 'react-router';
import store from '../store';
import log from 'loglevel';
import { Tabs, Tab } from 'material-ui/Tabs';
import TabSimulationContainer from '../containers/tab-simulation-container';
import TabModelDescriptionContainer from '../containers/tab-model-description-container';

const containerStyle = {
  marginTop: 20,
  marginLeft: 10,
  marginRight: 10,
  minHeight: 400
};

class HomeView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: 'model_description',
    };
  }

  handleChange = (value) => {
    this.setState({
      value: value,
    });
  };


  render() {
    self = this;
    return (
      <div className="row" style={containerStyle}>
        <Tabs
          value={this.state.value}
          onChange={this.handleChange}>
          <Tab label="Model description" value="model_description" >
            <TabModelDescriptionContainer />
          </Tab>
          <Tab label="Simulate" value="simulate">
            <TabSimulationContainer />
          </Tab>
        </Tabs>
      </div >
    )
  }
}

export default HomeView;