import * as types from '../actions/action-types';
import _ from 'lodash';
import log from 'loglevel';

const initialState = {
  parameters: {},
  filterString: null
};

const ModelParametersReducer = function(state = initialState, action) {
  switch(action.type) {
    
    case types.UPDATE_PARAMETERS_FILTER_STRING:
      return Object.assign({}, state, { filterString: action.filterString });

    case types.UPDATE_MODEL_PARAMETER:
      const voidValue = action.newValue === null || action.newValue === undefined ||
        action.newValue.replace(/ /g,'') === '';
      const validNumber = !voidValue && !isNaN(+action.newValue);
      const areEqual = +action.defaultValue === +action.newValue;

      if(voidValue){
        const isPresent = action.name in state.parameters;
        if(isPresent){
          // Remove the parameter
          let res = Object.assign({}, state);
          delete res.parameters[action.name];
          return res;
        }
      }else if (validNumber){
        // Add/modify parameter to the state
        let newState = {
          ...state,
          parameters: {
            ...state.parameters,
            [action.name]: action.newValue,
          }
        }
        return newState;
      }

    case types.REMOVE_MODEL_PARAMETER:
      let res = Object.assign({}, state);
      if(action.name in state.parameters){
        // Remove the parameter
        delete res.parameters[action.name];
      }
      return res;

    case types.RESET_MODEL_PARAMETERS:
      return Object.assign({}, state, initialState);

    default:
      return Object.assign({}, state);
    
  }
  return state;

}

export default ModelParametersReducer;