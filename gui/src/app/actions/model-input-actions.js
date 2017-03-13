import * as types from './action-types';

export function setInputFile(fileName) {
  return {
    type: types.SET_INPUT_FILE,
    fileName
  };
}

export function resetInputFile() {
  return {
    type: types.RESET_INPUT_FILE
  };
}
