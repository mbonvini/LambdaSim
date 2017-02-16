import React from 'react';
import { Router, Route, browserHistory, IndexRoute, Redirect } from 'react-router';

import MainLayout from './layouts/main-layout';

import HomeContainer from './containers/home-container';

// Set the routes associated to the layouts and pages
// Look at this when deploying to S3
// http://aserafin.pl/2016/03/23/react-router-on-amazon-s3/
export default (
  <Router history={browserHistory}>
    <Route component={MainLayout}>
      <Route path="/" component={HomeContainer} />
      <Redirect from="/*" to="/" />
    </Route>
  </Router>
);
