import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form'

// Reducers
import apiSettingsReducer from './api-settings-reducer';
import modelDescriptionReducer from './model-description-reducer';
import modelSimulationReducer from './model-simulation-reducer';
import loadingReducer from './loading-reducer';
import errorMessageReducer from './error-message-reducer';
import homeTabsReducer from './home-tabs-reducer';
import plotResultsReducer from './plot-results-reducer';
import modelParametersReducer from './model-parameters-reducer';
import dashboardDefinitionReducer from './dashboard-definition-reducer';
import configDefinitionreducer from './config-definition-reducer';
import modelInputReducer from './model-inputs-reducer';
import readmeReducer from './readme-reducer';

// Combine Reducers
var reducers = combineReducers({
    apiSettings: apiSettingsReducer,
    modelDescription: modelDescriptionReducer,
    modelSimulation: modelSimulationReducer,
    modelInput: modelInputReducer,
    form: formReducer,
    loading: loadingReducer,
    error: errorMessageReducer,
    homeTabs: homeTabsReducer,
    plotVariables: plotResultsReducer,
    modelParameters: modelParametersReducer,
    dashboardDefinition: dashboardDefinitionReducer,
    configDefinition: configDefinitionreducer,
    readme: readmeReducer
});

export default reducers;