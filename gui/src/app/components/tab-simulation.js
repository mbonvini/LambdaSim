import React from 'react';
import log from 'loglevel';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import { simulateModel } from '../api/lambda-sim-api';

import store from '../store';
import PlotContainer from '../containers/plot-container';
import SimulateForm from '../components/simulate-form';
import PlotSelectionMenuContainer from '../containers/plot-selection-menu-container';
import SimulationParametersDialogContainer from '../containers/simulation-parameters-dialog-container';
import SimulationSettingsDialog from './simulation-settings-dialog';

const styles = {
    headline: {
        fontSize: 24,
        paddingTop: 16,
        marginBottom: 12,
        fontWeight: 400,
    },
};


// For file inputs see
// https://github.com/callemall/material-ui/issues/3689

class TabSimulation extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showSettingsDialog: false,
            showParametersDialog: false
        }
    }

    openSettingsDialog = () => {
        this.setState({ showSettingsDialog: true });
    }

    closeSettingsDialog = () => {
        this.setState({ showSettingsDialog: false });
    }

    openParametersDialog = () => {
        this.setState({ showParametersDialog: true });
    }

    closeParametersDialog = () => {
        this.setState({ showParametersDialog: false });
    }

    runSimulation = (data) => {
        const simOptions = {ncp: 100};
        const parameters = this.props.modelParameters.parameters;
        const startTime = +data.startTime;
        const finalTime = +data.finalTime;
        simulateModel(startTime, finalTime, simOptions, parameters);
    };

    render = () => {
        return (
            this.props.modelDescription ? (
                <div className="row">
                    <div className="col s3">
                        <PlotSelectionMenuContainer />
                    </div>
                    <div className="col s9">
                        <SimulateForm
                          onSubmit={this.runSimulation}
                          openSettingsDialog={this.openSettingsDialog}
                          openParametersDialog={this.openParametersDialog}/>
                        <PlotContainer />
                    </div>

                    <SimulationSettingsDialog
                      open={this.state.showSettingsDialog}
                      onClose={this.closeSettingsDialog}
                    />

                    <SimulationParametersDialogContainer
                      open={this.state.showParametersDialog}
                      onClose={this.closeParametersDialog}
                    />
                </div>
            ) : (
                <div>
                    <h2 style={styles.headline}>No model selected</h2>
                    <p>
                        Please select the REST API of your model.
                    </p>
                </div>
            )
        );
    }
}

export default TabSimulation;