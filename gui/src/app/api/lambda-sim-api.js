import axios from 'axios';
import store from '../store';
import log from 'loglevel';
import { setLoadingMessage, resetLoadingMessage } from '../actions/loading-actions';
import { setErrorMessage } from '../actions/error-message-actions';

import { setModelDescription } from '../actions/model-actions';
import { saveSimulationResults } from '../actions/model-simulation-actions';
import { selectTab } from '../actions/home-tabs-actions';
import { setDashboardDefinition } from '../actions/dashboard-actions';
import { setConfigDefinition } from '../actions/config-actions';

/**
 * This function generates a GET HTTP request to the API and it
 * receives the JSON model config file.
 */
export function getModelConfig() {
  const url = store.getState().apiSettings.url;
  
  store.dispatch(setLoadingMessage('Get config...'));
  return axios.get(url+"?config=true")
    .then((response) => {
      store.dispatch(resetLoadingMessage());
      store.dispatch(setConfigDefinition(response.data));
      return response;
    })
    .catch((error) => {
      const msg = 'Errors while getting the API config file. '+
        'Please make sure the API URL is correct, the lambda function and '+
        'its apigateway are set up correctly.';
      store.dispatch(setErrorMessage(msg));
      store.dispatch(resetLoadingMessage());
      log.info(error);
    });
}

/**
 * This function generates a GET HTTP request to the API and it
 * receives the JSON model dashboard definition file.
 */
export function getModelDashboard() {
  const url = store.getState().apiSettings.url;
  
  store.dispatch(setLoadingMessage('Get dashboard...'));
  return axios.get(url+"?dashboard=true")
    .then((response) => {
      store.dispatch(resetLoadingMessage());
      store.dispatch(setDashboardDefinition(response.data));
      store.dispatch(selectTab('dashboard'));
      return response;
    })
    .catch((error) => {
      const msg = 'Errors while getting the API Dashboard file. ';
      store.dispatch(setErrorMessage(msg));
      store.dispatch(resetLoadingMessage());
      log.info(error);
    });
}

/**
 * This function generates a GET HTTP request to the API and it
 * receives the XML model description file of the FMU.
 */
export function getModelDescription() {
  const url = store.getState().apiSettings.url;
  
  store.dispatch(setLoadingMessage('Get model description...'));
  return axios.get(url)
    .then((response) => {
      store.dispatch(resetLoadingMessage());
      store.dispatch(setModelDescription(response.data));
      store.dispatch(selectTab('model_description'));
      return response;
    })
    .catch((error) => {
      const msg = 'Errors while getting the model description file. '+
        'Please make sure the API URL is correct, the lambda function and '+
        'its apigateway are set up correctly.';
      store.dispatch(setErrorMessage(msg));
      store.dispatch(resetLoadingMessage());
      store.dispatch(selectTab('info'));
      log.info(error);
    });
}

/**
 * This function generates a POST HTTP request to the API that
 * generates a simulation. The API replies with a JSON object
 * that contains the results of the simulation.
 */
export function simulateModel(startTime, finalTime, simOptions, parameters, inputFile) {
  const url = store.getState().apiSettings.url;
  let data = {
    start_time: startTime,
    final_time: finalTime,
    options: simOptions || {},
    parameters: parameters || {}
  };
  if (inputFile){
    data.input_name = inputFile;
  }

  store.dispatch(setLoadingMessage('Simulate...'));
  return axios.post(url, data)
    .then((response) => {
      store.dispatch(resetLoadingMessage());
      store.dispatch(saveSimulationResults(startTime, finalTime, simOptions, parameters, response.data));
    })
    .catch((error) => {
      store.dispatch(resetLoadingMessage());
      const msg = 'Errors while simulating the model.';
      store.dispatch(setErrorMessage(msg));
      log.info(error);
    });
}
