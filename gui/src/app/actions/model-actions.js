import * as types from './action-types';

export function setModelDescription(modelDescriptionXml) {
  return {
    type: types.SET_MODEL_DESCRIPTION,
    modelDescriptionXml
  };
}

export function resetModelDescription() {
  return {
    type: types.RESET_MODEL_DESCRIPTION
  };
}

export function updateFilterString(filterStr){
  return {
    type: types.UPDATE_FILTER_STRING,
    filterStr
  };
}

export function updateFilterParameters(isChecked){
  return {
    type: types.UPDATE_FILTER_PARAMETERS,
    isChecked
  };
}

export function updateFilterConstants(isChecked){
  return {
    type: types.UPDATE_FILTER_CONSTANTS,
    isChecked
  };
}

export function updateFilterInputs(isChecked){
  return {
    type: types.UPDATE_FILTER_INPUTS,
    isChecked
  };
}

export function updateFilterOutputs(isChecked){
  return {
    type: types.UPDATE_FILTER_OUTPUTS,
    isChecked
  };
}

export function updateFilterContinuous(isChecked){
  return {
    type: types.UPDATE_FILTER_CONTINUOUS,
    isChecked
  };
}