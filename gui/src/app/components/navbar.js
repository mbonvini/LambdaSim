import React from 'react';
import { Link } from 'react-router';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Dialog from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import log from 'loglevel';

import store from '../store';
import SelectApiForm from './select-api-form';
import { setApiSettingsUrl, resetApiSettings } from '../actions/api-settings-actions';
import { getModelDescription } from '../api/lambda-sim-api';
import { resetModelParameters } from '../actions/model-parameters-actions';
import { resetModelDescription } from '../actions/model-actions';
import { resetSimulationResults } from '../actions/model-simulation-actions';
import { resetPlotResults } from '../actions/plot-results-actions';
import { selectTab } from '../actions/home-tabs-actions';
import LoadingSpinnerContainer from '../containers/loading-spinner-container';
import { basePath } from '../router';

function handleTouchTap() {
  alert('onTouchTap triggered on the title component');
}

const style = (palette) => {
  return {
    backgroundColor: palette.primary1Color,
    textColor: palette.alternateTextColor
  }
};

const titleStyle = (palette) => {
  return {
    align: 'left',
    paddingLeft: 0,
    color: palette.textColor
  }
};


/**
 * This example uses an [IconButton](/#/components/icon-button) on the left, has a clickable `title`
 * through the `onTouchTap` property, and a [FlatButton](/#/components/flat-button) on the right.
 */
class Navbar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      openMenu: false,
      openDialog: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit = (data) => {
    store.dispatch(setApiSettingsUrl(data.url));
    getModelDescription();
    this.handleCloseDialog();
  };

  handleOpenDialog = () => {
    this.setState({ openDialog: true });
  };

  handleCloseDialog = () => {
    this.setState({ openDialog: false });
  };

  clearSettings = () => {
    store.dispatch(resetApiSettings());
    store.dispatch(resetModelParameters());
    store.dispatch(resetModelDescription());
    store.dispatch(resetSimulationResults());
    store.dispatch(resetPlotResults());
    store.dispatch(selectTab('info'));
    this.handleCloseDialog();
  };

  toggleMenu = () => this.setState({ openMenu: !this.state.openMenu });

  toolBarHeaderMenu = () => (
    <ToolbarGroup firstChild={true}>
      <Link to={basePath+"/"}>
        <img src={basePath+"/images/lsim-icon-small.png"} height="50px" style={{ margin: 10 }} />
      </Link>
    </ToolbarGroup>
  );

  render = () => {

    return (
      <div>
        <Dialog
          title="Select the API"
          modal={false}
          open={this.state.openDialog}>
          Use this dialog to enter the URL of the REST API.
          The URL has the following format
          <pre>https://<b>API_ID</b>.execute-api.<b>AWS_REGION</b>.amazonaws.com/prod/<b>FUNCTION_NAME</b></pre>
          where
          <ol>
            <li><code><b>API_ID</b></code> is the ID of the AWS apigateway REST API,</li>
            <li><code><b>AWS_REGION</b></code> is the specifier of the AWS region where the API is deployed,</li>
            <li><code><b>FUNCTION_NAME</b></code> is the name of lambda function exposed through the REST API.</li>
          </ol>

          <SelectApiForm
            close={this.handleCloseDialog}
            clear={this.clearSettings}
            onSubmit={this.handleSubmit}
          />

        </Dialog>

        <Toolbar style={style(this.props.muiTheme.palette)}>

          {this.toolBarHeaderMenu()}

          <ToolbarGroup lastChild={true} style={{ float: "right" }}>
            <code>
              {this.props.apiSettings.url && (
                  this.props.apiSettings.url
              )}
            </code>
            <ToolbarSeparator />
            <RaisedButton
              label="Select API"
              secondary={true}
              onTouchTap={this.handleOpenDialog}
            />

            <LoadingSpinnerContainer />
          </ToolbarGroup>

          <Drawer open={this.state.openMenu} docked={true} disableSwipeToOpen={true} width={300}>
            <Toolbar style={style(this.props.muiTheme.palette)}>
              {this.toolBarHeaderMenu()}
            </Toolbar>
          </Drawer>

        </Toolbar>
      </div>
    );
  }
}

export default muiThemeable()(Navbar);