import React from 'react';
import { Router, Route, browserHistory, Redirect } from 'react-router';

import MainLayout from './layouts/main-layout';
import HomeContainer from './containers/home-container';
import AboutView from './views/about.js';

export const basePath = process.env.NODE_ENV === 'production' ? '/LambdaSim' : '';

// Set the routes associated to the layouts and pages
// Look at this when deploying to S3
// http://aserafin.pl/2016/03/23/react-router-on-amazon-s3/
export default (
  <Router history={browserHistory}>
    <Route component={MainLayout}>
      <Route path={basePath+"/"} component={HomeContainer} />
      <Route path={basePath+"/about"} component={AboutView} />
      <Redirect from={basePath+"/*"} to={basePath+"/"} />
    </Route>
  </Router>
);
