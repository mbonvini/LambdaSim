import * as types from './action-types';

export function setErrorMessage(message) {
  return {
    type: types.SET_ERROR_MESSAGE,
    message
  };
}

export function resetErrorMessage() {
  return {
    type: types.RESET_ERROR_MESSAGE
  };
}