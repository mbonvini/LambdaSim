import React from 'react';
import { Link } from 'react-router';

class Footer extends React.Component {

  render() {
    return (
      <footer className="page-footer">
          <div className="container">
            <div className="row">
              <div className="col l6 s12">
                <p className="">
                  With <b>λ-Sim</b> you can create a REST API from
                  a simulation models. For more info
                  go to <b><a target="_blank" href="https://github.com/mbonvini/LambdaSim">github.com/mbonvini/LambdaSim</a></b>.
                </p>
                <a className="github-button"
                href="https://github.com/mbonvini/LambdaSim"
                data-icon="octicon-star"
                data-style="mega"
                data-count-href="/mbonvini/LambdaSim/stargazers"
                data-count-api="/repos/mbonvini/LambdaSim#stargazers_count"
                data-count-aria-label="# stargazers on GitHub"
                aria-label="Star mbonvini/LambdaSim on GitHub">
                  Star
                </a>
              </div>
              <div className="col l4 offset-l2 s12">
                <h5 className="">Links</h5>
                <ul>
                  <li><Link to="/" className="">Home</Link></li>
                  <li><Link to="/about" className="">About</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-copyright">
            <div className="container black-text">
              © λ-Sim - All rights reserved
              <a className="right" href="#!">
                Made in Berkeley, CA
              </a>
            </div>
          </div>
        </footer>
    );
  }
}

export default Footer;
