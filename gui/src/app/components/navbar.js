import React from 'react';
import { Link } from 'react-router';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import FlatButton from 'material-ui/FlatButton';
import Badge from 'material-ui/Badge';
import Dialog from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import log from 'loglevel';
import ActionLockOutline from 'material-ui/svg-icons/action/lock-outline';
import ActionAccountBox from 'material-ui/svg-icons/action/account-box';
import ActionExitToApp from 'material-ui/svg-icons/action/exit-to-app';
import ActionList from 'material-ui/svg-icons/action/list';
import TextField from 'material-ui/TextField';

import store from '../store';
import SelectApiForm from './select-api-form';
import { setApiSettingsUrl, resetApiSettings } from '../actions/api-settings-actions';
import { getModelDescription } from '../api/lambda-sim-api';

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
      open: false,
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
    this.handleCloseDialog();
  };

  toggleMenu = () => this.setState({ open: !this.state.open });

  toolBarHeaderMenu = () => (
    <ToolbarGroup firstChild={true}>
      <IconButton onClick={this.toggleMenu}><MoreVertIcon /></IconButton>
      <Link to="/">
        <img src="/images/Lambda-logo.svg" height="50px" style={{ margin: 10 }} />
      </Link>
      <Link to="/">
        <ToolbarTitle text={"Sim"} style={titleStyle(this.props.muiTheme.palette)} />
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
              {
                this.props.apiSettings.url && (
                  this.props.apiSettings.url
                 )
              }
            </code>
            <ToolbarSeparator />
            <RaisedButton
              label="Select API"
              secondary={true}
              onTouchTap={this.handleOpenDialog}
            />
          </ToolbarGroup>

          <Drawer open={this.state.open} docked={true} disableSwipeToOpen={true} width={280}>
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