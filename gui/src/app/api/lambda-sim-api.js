import axios from 'axios';
import store from '../store';
import log from 'loglevel';

import { setModelDescription } from '../actions/model-actions';

export function getModelDescription() {
  const url = store.getState().apiSettings.url;
  return axios.get(url)
    .then((response) => {
      store.dispatch(setModelDescription(response.data));
      return response;
    })
    .catch((error) => {
      log.info(error);
    });
}