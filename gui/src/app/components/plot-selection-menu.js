/* global Plotly */
import React from 'react';
import log from 'loglevel';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';

import { setPlotVariable, updatePlotFilterString } from '../actions/plot-results-actions';
import store from '../store';

const menuItemsStyle = {
    paddingLeft: "20px"
};

class PlotSelectionMenu extends React.Component {

    constructor(props) {
        super(props);
    }

    filterVariable = (variable) => {
        const nameCondition = this.props.filterString === null ||
            this.props.filterString === '' ||
            variable.includes(this.props.filterString);
        return this.props.plotVariables[variable] || nameCondition;
    }

    render() {
        if (!this.props.plotVariables) {
            return (
                <div />
            );
        } else {
            return (
                <div>
                    <div className="valign-wrapper" style={{height: '100px'}}>
                        <TextField
                            hintText="model_name.variable_name"
                            floatingLabelText="Filter by name"
                            fullWidth={true}
                            style={{ paddingLeft: "10px" }}
                            onChange={(e) => store.dispatch(updatePlotFilterString(e.target.value))}
                        />
                    </div>
                    <Table
                    multiSelectable={true}
                    fixedHeader={true}
                    selectable={false}
                    style={{ tableLayout: "fixed" }}>
                        <TableBody displayRowCheckbox={false}>
                            {Object.keys(this.props.plotVariables).filter(
                                name => this.filterVariable(name)
                            ).map((name, j) =>
                                <TableRow key={j}>
                                    <TableRowColumn style={{ padding: 10, width: 40, align: "center" }}>
                                        <Checkbox onCheck={
                                            (event, isChecked) => store.dispatch(setPlotVariable(name, isChecked))
                                        } 
                                        checked={this.props.plotVariables[name]}/>
                                    </TableRowColumn>
                                    <TableRowColumn>{name}</TableRowColumn>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            );
        }
    }
}

export default PlotSelectionMenu;