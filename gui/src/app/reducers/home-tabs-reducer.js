import * as types from '../actions/action-types';
import _ from 'lodash';
import log from 'loglevel';

const initialState = {
  tabSelected: 'info'
};

const HomeTabsReducer = function(state = initialState, action) {
  switch(action.type) {
    
    case types.SELECT_TAB:
      return Object.assign({}, state, { tabSelected: action.tabName });

    case types.RESET_SELECTED_TAB:
      return Object.assign({}, state, initialState);

    default:
      return Object.assign({}, state);
    
  }
  return state;

}

export default HomeTabsReducer;