import React from 'react';
import log from 'loglevel';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import {
    updateFilterString, updateFilterParameters, updateFilterConstants,
    updateFilterInputs, updateFilterOutputs, updateFilterContinuous,
    updateFilterHidden
} from '../actions/model-actions';
import {
    Table, TableBody, TableRow, TableRowColumn,
    TableHeader, TableHeaderColumn
} from 'material-ui/Table';

import store from '../store';

const styles = {
    headline: {
        fontSize: 24,
        paddingTop: 16,
        marginBottom: 12,
        fontWeight: 400,
    },
};

class TabModelDescription extends React.Component {

    constructor(props) {
        super(props);
    }

    filterVariable = (variable) => {
        const isHidden = variable.name[0] === '_';
        const preCondition = (this.props.filterParameters && variable.variability === 'parameter') ||
        (this.props.filterConstants && variable.variability === 'constant') ||
        (this.props.filterInputs && variable.causality === 'input') ||
        (this.props.filterOutputs && variable.causality === 'output') ||
        (this.props.filterContinuous && variable.variability === 'continuous');
        
        const nameCondition = this.props.filterStr === null ||
        this.props.filterStr === '' ||
        variable.name.includes(this.props.filterStr);

        const hiddenCond = (isHidden && this.props.filterHidden) || (!isHidden);
        return preCondition && nameCondition && hiddenCond;
    }

    render = () => {
        return (
            this.props.modelDescription ? (
                <div>
                    <h4 style={styles.headline}>Description</h4>
                    <Table selectable={false}>
                        <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                            <TableRow>
                                <TableHeaderColumn>Name</TableHeaderColumn>
                                <TableHeaderColumn>Value</TableHeaderColumn>
                            </TableRow>
                        </TableHeader>
                        <TableBody displayRowCheckbox={false}>
                            {Object.keys(this.props.modelDescription.description).map(
                                (name, value) =>
                                <TableRow key={value}>
                                    <TableRowColumn>{name}</TableRowColumn>
                                    <TableRowColumn>{this.props.modelDescription.description[name]}</TableRowColumn>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <h4 style={styles.headline}>Variables, constants, parameters, inputs and outputs</h4>
                    <TextField
                        hintText="model_name.variable_name"
                        floatingLabelText="Filter by name"
                        fullWidth={true}
                        onChange={(e) => store.dispatch(updateFilterString(e.target.value))}
                    />
                    <div className="row">
                        <div className="col s6">
                            <Checkbox label="Parameters" checked={this.props.filterParameters}
                            onCheck={(e, isChecked) => store.dispatch(updateFilterParameters(isChecked))}/>
                            <Checkbox label="Constants" checked={this.props.filterConstants}
                            onCheck={(e, isChecked) => store.dispatch(updateFilterConstants(isChecked))}/>
                            <Checkbox label="Inputs" checked={this.props.filterInputs}
                            onCheck={(e, isChecked) => store.dispatch(updateFilterInputs(isChecked))}/>
                        </div>
                        <div className="col s6">
                            <Checkbox label="Outputs" checked={this.props.filterOutputs}
                            onCheck={(e, isChecked) => store.dispatch(updateFilterOutputs(isChecked))}/>
                            <Checkbox label="Continuous" checked={this.props.filterContinuous}
                            onCheck={(e, isChecked) => store.dispatch(updateFilterContinuous(isChecked))}/>
                            <Checkbox label="Hidden" checked={this.props.filterHidden}
                            onCheck={(e, isChecked) => store.dispatch(updateFilterHidden(isChecked))}/>
                        </div>
                    </div>
                    
                    <Table>
                        <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                            <TableRow>
                                <TableHeaderColumn>Name</TableHeaderColumn>
                                <TableHeaderColumn>Variability</TableHeaderColumn>
                                <TableHeaderColumn>Causality</TableHeaderColumn>
                                <TableHeaderColumn>Type</TableHeaderColumn>
                                <TableHeaderColumn>Value</TableHeaderColumn>
                            </TableRow>
                        </TableHeader>
                        <TableBody displayRowCheckbox={false} showRowHover={true} preScanRows={false}>
                            {this.props.modelDescription.modelVariables.filter(
                                e => this.filterVariable(e)
                            ).map(
                                (variable) => 
                                <TableRow key={variable.name}>
                                    <TableRowColumn>{variable.name}</TableRowColumn>
                                    <TableRowColumn>{variable.variability}</TableRowColumn>
                                    <TableRowColumn>{variable.causality}</TableRowColumn>
                                    <TableRowColumn>{variable.type}</TableRowColumn>
                                    <TableRowColumn>{variable.typeAttr.start}</TableRowColumn>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
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

export default TabModelDescription;
