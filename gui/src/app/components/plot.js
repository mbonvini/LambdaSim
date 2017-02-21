/* global Plotly */
import React from 'react';
import log from 'loglevel';

const layout = { 
    margin: {t: 30},
    showlegend: true,
    xaxis: {title: 'Time [s]'},
    legend:{orientation:'h', x: 0.02, y: 1.0}
};

const data = [{
    x: [],
    y: [],
    mode: 'lines',
    name: 'A'
}];

class Plot extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            readyToReplot: false,
            data: data
        };
    }

    componentDidMount(){
        Plotly.newPlot('plot', this.state.data, layout, {showLink: false});
    }

    componentWillReceiveProps(){
        this.state.readyToReplot = true;
    }

    componentDidUpdate(){
        if(this.props.plotVariables && this.props.modelSimulation.results && this.state.readyToReplot){
            const time = this.props.modelSimulation.results['time'];
            let newData = [];
            for(let varName in this.props.plotVariables){
                if(this.props.plotVariables[varName]){
                    newData.push({
                        x: time,
                        y: this.props.modelSimulation.results[varName],
                        mode: 'lines',
                        name: varName
                    });
                }
            }
            this.state.data = newData;
            this.state.readyToReplot = false;

            let plotDiv = document.getElementById('plot');
            plotDiv.data = this.state.data;
            Plotly.redraw(plotDiv); 
        }
    }

    render() {
        return (
            <div id="plot">
            </div>
        );
    }
}

export default Plot;