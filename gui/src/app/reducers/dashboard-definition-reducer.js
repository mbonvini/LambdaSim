import * as types from '../actions/action-types';
import _ from 'lodash';
import log from 'loglevel';
import { Dashboard } from '../classes/dashboard';

const initialState = {
  dashboard: null
};

const DashboardDefinitionReducer = function(state = initialState, action) {
  switch(action.type) {
    
    case types.SET_DASHBOARD_DEFINITION:
      const d = new Dashboard(action.dashboard)
      return Object.assign({}, state, { dashboard: d});

    case types.RESET_DASHBOARD_DEFINITION:
      return Object.assign({}, state, initialState);

    default:
      return Object.assign({}, state);
    
  }
  return state;

}

export default DashboardDefinitionReducer;