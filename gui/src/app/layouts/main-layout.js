import React from 'react';
import NavbarContainer from '../containers/navbar-container.js';
import Footer from '../components/footer.js';

const MainLayout = React.createClass({
  render: function() {
    return (
	    <div>
				<div style={{position: 'fixed', width:'100%', top:0, zIndex: 997}}>
					<NavbarContainer/>
				</div>
				<div className="" style={{paddingTop: 60, minHeight: 500}}>
	    		{this.props.children}
	    	</div>
	    	<Footer />
	    </div>
    );
  }
});

export default MainLayout;
