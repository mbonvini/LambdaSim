import * as types from './action-types';

export function setDashboardDefinition(dashboard) {
  return {
    type: types.SET_DASHBOARD_DEFINITION,
    dashboard
  };
}

export function resetDashboardDefinition() {
  return {
    type: types.RESET_DASHBOARD_DEFINITION
  };
}