import log from 'loglevel';
import React from 'react';

class DashboardPlot extends React.Component {

  constructor(props) {
    super(props);
    this.buildData = this.buildData.bind(this);
    this.state = {
      layout: this.props.widget.layout,
      data: this.buildData(),
      readyToReplot: false
    };
  }

  componentWillReceiveProps(){
    this.state.readyToReplot = true;
  }

  componentDidUpdate(){
    if(this.props.modelSimulation.results && this.state.readyToReplot){
      const update = this.buildData();
      this.state.readyToReplot = false;
      this.state.data = update;

      let plotDiv = document.getElementById(this.props.uniqueKey);
      plotDiv.data = this.state.data;
      Plotly.redraw(plotDiv);
    }
  }

  /**
   * This method looks at the definition of the data in the
   * widget.data attribute and fills it with actual data
   */
  buildData(){
    let plot_data = [];
    this.props.widget.data.map((series) => {
      let var_data = Object.assign({}, series);

      // Get the name of the variables that hold the data in the results
      const x_var_name = series.x.replace("$result.", "");
      const y_var_name = series.y.replace("$result.", "");

      // Verify if there's data
      if (this.props.modelSimulation.results){
        var_data.x = this.props.modelSimulation.results[x_var_name];
        var_data.y = this.props.modelSimulation.results[y_var_name];
      }else{
        var_data.x = [];
        var_data.y = [];
      }

      plot_data.push(var_data);
    });

    return plot_data;
  }

  componentDidMount(){
      Plotly.newPlot(
        this.props.uniqueKey,
        this.state.data,
        this.state.layout,
        {showLink: false}
      );
  }

  render() {
    return (
      <div id={this.props.uniqueKey}>
      </div>
    );
  }
}

export default DashboardPlot;
