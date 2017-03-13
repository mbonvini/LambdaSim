import * as types from '../actions/action-types';
import _ from 'lodash';
import log from 'loglevel';

const initialState = {
    fileName: null
};

const modelInputReducer = function(state = initialState, action) {
  switch(action.type) {
    
    case types.SET_INPUT_FILE:
      return Object.assign({}, state, { fileName: action.fileName});

    case types.RESET_INPUT_FILE:
      return Object.assign({}, initialState);

    default:
      return Object.assign({}, state);
    
  }
  return state;

}

export default modelInputReducer;