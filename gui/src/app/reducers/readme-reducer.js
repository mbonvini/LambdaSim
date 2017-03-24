import * as types from '../actions/action-types';
import _ from 'lodash';
import log from 'loglevel';

const initialState = {
  content: ''
};

const readmeReducer = function(state = initialState, action) {
  switch(action.type) {
    
    case types.SET_README:
      return Object.assign({}, state, { content: action.readme });

    case types.RESET_README:
      return Object.assign({}, state, initialState);

    default:
      return Object.assign({}, state);
    
  }
  return state;

}

export default readmeReducer;