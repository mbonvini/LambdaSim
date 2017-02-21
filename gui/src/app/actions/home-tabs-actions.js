import * as types from './action-types';

export function selectTab(tabName) {
  return {
    type: types.SELECT_TAB,
    tabName
  };
}

export function resetSelectedTab() {
  return {
    type: types.RESET_SELECTED_TAB
  };
}