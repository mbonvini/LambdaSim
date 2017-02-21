/* global Plotly */
import React from 'react';
import log from 'loglevel';
import CircularProgress from 'material-ui/CircularProgress';

class LoadingSpinner extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        if(this.props.loading.message){
            return (
                <div className="valign-wrapper">
                    <CircularProgress color="black" thickness={1} style={{marginRight:10}}/>
                    <span className="valign">
                        {this.props.loading.message}
                    </span>
                </div>
            )
        }else{
            return (<div/>);
        }
    }
}

export default LoadingSpinner;