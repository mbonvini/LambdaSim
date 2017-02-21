import * as types from '../actions/action-types';
import _ from 'lodash';
import log from 'loglevel';

const initialState = {
  message: null
};

const LoadingReducer = function(state = initialState, action) {
  switch(action.type) {
    
    case types.SET_LOADING_MESSAGE:
      return Object.assign({}, state, { message: action.message });

    case types.RESET_LOADING_MESSAGE:
      return Object.assign({}, state, initialState);

    default:
      return Object.assign({}, state);
    
  }
  return state;

}

export default LoadingReducer;