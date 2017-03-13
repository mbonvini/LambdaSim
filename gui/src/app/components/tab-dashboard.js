import React from 'react';
import log from 'loglevel';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import { simulateModel } from '../api/lambda-sim-api';

import store from '../store';
import SimulateForm from '../components/simulate-form';
import PlotSelectionMenuContainer from '../containers/plot-selection-menu-container';
import SimulationSettingsDialog from './simulation-settings-dialog';

import { Dashboard } from '../classes/dashboard';

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

class TabDashboard extends React.Component {

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

    runSimulation = (data) => {
        const simOptions = {};
        const parameters = this.props.modelParameters.parameters;
        const inputFileName = this.props.inputFileName;
        const startTime = +data.startTime;
        const finalTime = +data.finalTime;
        simulateModel(startTime, finalTime, simOptions, parameters, inputFileName);
    };

    render = () => {
        return (
            this.props.modelDescription ? (
                this.props.dashboard ? (
                    <div>
                        <div className="row">
                            <div className="col s12">
                                <SimulateForm
                                onSubmit={this.runSimulation}
                                openSettingsDialog={this.openSettingsDialog}
                                openParametersDialog={this.openParametersDialog}
                                showParametersButton={false}/>
                            </div>

                            <SimulationSettingsDialog
                            open={this.state.showSettingsDialog}
                            onClose={this.closeSettingsDialog}
                            />

                        </div>
                        {this.props.dashboard.definition.map(
                            (row, i) =>
                                <div className="row" key={"r_"+i}>
                                {row.map(
                                    (col, j) =>
                                        <div className={col.col_class} key={"c_"+i+"_"+j}>
                                            {col.widgets.map(
                                                (widget, k) =>
                                                    Dashboard.getComponentWidget(widget, i, j, k)
                                                )
                                            }
                                        </div>
                                    )
                                }
                                </div>
                            )
                        }
                    </div>
                ) : (
                    <div>
                        <h2 style={styles.headline}>No Dashboard</h2>
                        <p>
                            This model doesn't have a dashboard associated to it.
                        </p>
                    </div>
                )
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

export default TabDashboard;