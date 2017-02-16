/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Provider } from 'react-redux';
import {
  grey300, orange300, amber500, amber300, blueGrey100, blueGrey500,
  white, darkBlack, fullBlack, deepOrange400, amber600
} from 'material-ui/styles/colors';
import {fade} from 'material-ui/utils/colorManipulator';

import router from './router';
import store from './store';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: orange300,
    primary2Color: deepOrange400,
    primary3Color: amber300,
    accent1Color: blueGrey100,
    accent2Color: blueGrey100,
    accent3Color: blueGrey500,
    textColor: darkBlack,
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey300,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: grey300,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: fullBlack,
  },
  toolbar: {
    height: 60,
    textColor: white
  }
});

class Main extends Component {
  
  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>{router}</Provider>
      </MuiThemeProvider>
    );
  }
}

export default Main;
