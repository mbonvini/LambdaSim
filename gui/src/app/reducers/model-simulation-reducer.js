import * as types from '../actions/action-types';
import _ from 'lodash';
import log from 'loglevel';

const initialState = {
    startTime: null,
    finalTime: null,
    options: null,
    parameters: null,
    results: null,
};

const modelSimulationReducer = function(state = initialState, action) {
  switch(action.type) {
    
    case types.SAVE_SIMULATION_RESULTS:
      return Object.assign(
          {}, state, {
            startTime: action.startTime,
            finalTime: action.finalTime,
            options: action.simOptions,
            parameters: action.parameters,
            results: action.response
        });

    case types.RESET_SIMULATION_RESULTS:
      return Object.assign({}, initialState);

    default:
      return Object.assign({}, state);
    
  }
  return state;

}

export default modelSimulationReducer;