import * as types from '../actions/action-types';
import _ from 'lodash';
import log from 'loglevel';
import { ModelDescription } from '../classes/model-description';

const initialState = {
  description: null,
  filterStr: null,
  filterParameters: true,
  filterConstants: false,
  filterInputs: true,
  filterOutputs: true,
  filterContinuous: true
};

const parse = new DOMParser();

const modelReducer = function(state = initialState, action) {
  switch(action.type) {
    
    case types.SET_MODEL_DESCRIPTION:
      const md = new ModelDescription();
      md.loadFromXml(action.modelDescriptionXml);
      return Object.assign({}, state, { description: md});

    case types.RESET_MODEL_DESCRIPTION:
      return Object.assign({}, state, { description: null});

    case types.UPDATE_FILTER_STRING:
      return Object.assign({}, state, { filterStr: action.filterStr});

    case types.UPDATE_FILTER_PARAMETERS:
      return Object.assign({}, state, { filterParameters: action.isChecked});

    case types.UPDATE_FILTER_CONSTANTS:
      return Object.assign({}, state, { filterConstants: action.isChecked});

    case types.UPDATE_FILTER_INPUTS:
      return Object.assign({}, state, { filterInputs: action.isChecked});

    case types.UPDATE_FILTER_OUTPUTS:
      return Object.assign({}, state, { filterOutputs: action.isChecked});

    case types.UPDATE_FILTER_CONTINUOUS:
      return Object.assign({}, state, { filterContinuous: action.isChecked});

    default:
      return Object.assign({}, state);
    
  }
  return state;

}

export default modelReducer;