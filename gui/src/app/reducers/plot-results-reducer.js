import * as types from '../actions/action-types';
import _ from 'lodash';
import log from 'loglevel';

const initialState = {
    plotVariables: null,
    filterString: null
};

const plotResultsReducer = function(state = initialState, action) {
  switch(action.type) {
    
    case types.SAVE_SIMULATION_RESULTS:
      if(state.plotVariables){
        return Object.assign({}, state);
      }else{
        let plotVars = {};
        for(let resName in action.response){
          if(resName !== 'time'){
            plotVars[resName] = false;
          }
        }
        return Object.assign({}, state, {plotVariables: plotVars});
      }

    case types.SET_PLOT_VARIABLE:
      if(action.varName){
        return {
          ...state,
          plotVariables: {
            ...state.plotVariables,
            [action.varName]: action.show
          }
        }
      }else{
        return Object.assign({}, state);
      }
      
    case types.UPDATE_PLOT_FILTER_STRING:
      return Object.assign({}, state, {filterString: action.filterStr});

    case types.RESET_PLOT_RESULTS:
      return Object.assign({}, initialState);

    default:
      return Object.assign({}, state);
    
  }
  return state;

}

export default plotResultsReducer;