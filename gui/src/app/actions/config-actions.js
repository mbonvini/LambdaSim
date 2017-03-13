import * as types from './action-types';

export function setConfigDefinition(config) {
  return {
    type: types.SET_CONFIG_DEFINITION,
    config
  };
}

export function resetConfigDefinition() {
  return {
    type: types.RESET_CONFIG_DEFINITION
  };
}