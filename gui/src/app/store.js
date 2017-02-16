import { createStore } from 'redux';
import {persistStore, autoRehydrate} from 'redux-persist';
import reducers from './reducers';

const store = createStore(reducers, undefined, autoRehydrate())
persistStore(store);
export default store;



