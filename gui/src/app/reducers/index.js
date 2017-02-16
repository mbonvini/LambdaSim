import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form'

// Reducers
import apiSettingsReducer from './api-settings-reducer';
import modelReducer from './model-reducer';

// Combine Reducers
var reducers = combineReducers({
    apiSettings: apiSettingsReducer,
    model: modelReducer,
    form: formReducer
});

export default reducers;