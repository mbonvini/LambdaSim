import * as types from './action-types';

export function setPlotVariable(varName, show){
  return {
    type: types.SET_PLOT_VARIABLE,
    varName,
    show
  };
}

export function updatePlotFilterString(filterStr){
  return {
    type: types.UPDATE_PLOT_FILTER_STRING,
    filterStr
  }
}