import * as types from './action-types';
import log from 'loglevel';

export function setApiSettingsUrl(url) {
  return {
    type: types.SET_API_SETTINGS_URL,
    url
  };
}

export function setApiSettingsToken(token) {
  return {
    type: types.SET_API_SETTINGS_TOKEN,
    token
  };
}

export function resetApiSettings() {
  return {
    type: types.RESET_API_SETTINGS
  };
}
