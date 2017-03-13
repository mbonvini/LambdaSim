import * as types from '../actions/action-types';
import _ from 'lodash';
import log from 'loglevel';
import { Dashboard } from '../classes/dashboard';

const initialState = {
  config: null
};

const DashboardDefinitionReducer = function(state = initialState, action) {
  switch(action.type) {
    
    case types.SET_CONFIG_DEFINITION:
      return Object.assign({}, state, { config: action.config});

    case types.RESET_CONFIG_DEFINITION:
      return Object.assign({}, state, initialState);

    default:
      return Object.assign({}, state);
    
  }
  return state;

}

export default DashboardDefinitionReducer;