import * as types from './action-types';


export function resetModelParameters() {
  return {
    type: types.RESET_MODEL_PARAMETERS
  };
}

export function updateParametersFilterString(filterString){
  return {
    type: types.UPDATE_PARAMETERS_FILTER_STRING,
    filterString
  };
}

export function updateModelParameter(name, defaultValue, newValue){
  return {
    type: types.UPDATE_MODEL_PARAMETER,
    name, defaultValue, newValue
  };
}

export function removeModelParameter(name){
  return {
    type: types.REMOVE_MODEL_PARAMETER,
    name
  }
}