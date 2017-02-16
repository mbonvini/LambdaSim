import { browserHistory } from 'react-router';
import store from '../store';
import log from 'loglevel';

/**
 * Redirect to path if the profile property has an undefined username
 * associated to it.
 */
export default function redirectIfNotLogged(path, next) {
  if(store.getState().user.userProfile.username === undefined){
    if(next === undefined || next === null){
      browserHistory.push(path);
    }else{
      browserHistory.push(path+"?next="+next);
    }
    
  }
}