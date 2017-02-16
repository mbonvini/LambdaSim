import React from 'react';
import { Link } from 'react-router';

class Footer extends React.Component {

  render() {
    return (
      <footer className="page-footer">
          <div className="container">
            <div className="row">
              <div className="col l6 s12">
                <h5 className="">λ-Sim</h5>
                  <p className="">
                    allows you to create a REST API from
                    a simulation models. For more info
                    go to Github
                    at <b><a target="_blank" href="https://github.com/mbonvini/LambdaSim">mbonvini/LambdaSim</a></b>.
                  </p>
              </div>
              <div className="col l4 offset-l2 s12">
                <h5 className="">Links</h5>
                <ul>
                  <li><Link to="/about" className="">About</Link></li>
                  <li><Link to="/contact_us" className="">Contact Us</Link></li>
                  <li><Link to="/privacy_policy" className="">Privacy policy</Link></li>
                  <li><Link to="/terms_and_conditions" className="">Terms and Conditions</Link></li>
                  <li><Link to="/faq" className="">FAQ</Link></li>
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
