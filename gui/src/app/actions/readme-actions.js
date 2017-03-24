import * as types from './action-types';

export function setReadme(readme) {
  return {
    type: types.SET_README,
    readme
  };
}

export function resetReadme() {
  return {
    type: types.RESET_README
  };
}