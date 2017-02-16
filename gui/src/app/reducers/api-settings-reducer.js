import * as types from '../actions/action-types';
import _ from 'lodash';
import log from 'loglevel';

const initialState = {
  url: null,
  token: null
};

const apiSettingsReducer = function(state = initialState, action) {
  switch(action.type) {
    
    case types.SET_API_SETTINGS_URL:
      return Object.assign({}, state, { url: action.url });

    case types.SET_API_SETTINGS_TOKEN:
      return Object.assign({}, state, { token: action.token});

    case types.RESET_API_SETTINGS:
      return Object.assign({}, state, initialState);

    default:
      return Object.assign({}, state);
    
  }
  return state;

}

export default apiSettingsReducer;