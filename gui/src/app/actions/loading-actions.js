import * as types from './action-types';

export function setLoadingMessage(message) {
  return {
    type: types.SET_LOADING_MESSAGE,
    message
  };
}

export function resetLoadingMessage() {
  return {
    type: types.RESET_LOADING_MESSAGE
  };
}