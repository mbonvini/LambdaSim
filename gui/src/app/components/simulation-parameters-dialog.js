import React from 'react';
import log from 'loglevel';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import Chip from 'material-ui/Chip';
import RaisedButton from 'material-ui/RaisedButton';
import {
    Table, TableBody, TableRow, TableRowColumn,
    TableHeader, TableHeaderColumn
} from 'material-ui/Table';
import {
    updateParametersFilterString, updateModelParameter,
    removeModelParameter, resetModelParameters
} from '../actions/model-parameters-actions';
import store from '../store';

const styles = {
  chip: {
    margin: 4,
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
};

class SimulationParametersDialog extends React.Component {

    constructor(props) {
        super(props);
    }

    filterVariable = (variable) => {
        const isHidden = variable.name[0] === '_';
        const isParameter = variable.variability === 'parameter';
        const isSelected = variable.name in this.props.modelParameters.parameters;
        const nameCondition = this.props.modelParameters.filterString === null ||
            this.props.modelParameters.filterString === '' ||
            variable.name.includes(this.props.modelParameters.filterString);
        return isParameter && !isHidden && (nameCondition || isSelected);
    };

    render = () => {
        return (
            <Dialog
                title="Parameters"
                modal={false}
                open={this.props.open}
                onRequestClose={this.props.onClose}
            >
                <div style={styles.wrapper}>
                {
                    Object.keys(this.props.modelParameters.parameters).map(
                        (name) => 
                        <Chip key={name}
                            onRequestDelete={() => store.dispatch(removeModelParameter(name))}
                            style={styles.chip}
                            >
                            {name}
                            </Chip>
                    )
                }
                </div>
                <RaisedButton label='Clear all' style={{marginRight: 20}}
                    onClick={() => store.dispatch(resetModelParameters())}
                />
                <TextField
                    hintText="model_name.parameter_name"
                    floatingLabelText="Filter by name"
                    fullWidth={false}
                    style={{width: 350}}
                    onChange={(e) => store.dispatch(updateParametersFilterString(e.target.value))}
                />
                <Table selectable={false}>
                    <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                        <TableRow>
                            <TableHeaderColumn>Name</TableHeaderColumn>
                            <TableHeaderColumn>Default</TableHeaderColumn>
                            <TableHeaderColumn>Value</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false} showRowHover={false} preScanRows={false}>
                        {this.props.modelDescription.modelVariables.filter(
                            e => this.filterVariable(e)
                        ).map(
                            (variable) => 
                            <TableRow key={variable.valueReference} selectable={false}>
                                <TableRowColumn>{variable.name}</TableRowColumn>
                                <TableRowColumn>{variable.typeAttr.start}</TableRowColumn>
                                <TableRowColumn>
                                    <TextField
                                      name={variable.name}
                                      hintText='Click to edit'
                                      value={variable.name in this.props.modelParameters.parameters ? this.props.modelParameters.parameters[variable.name] : ''}
                                      onChange={
                                          (e) => store.dispatch(updateModelParameter(
                                            variable.name, variable.typeAttr.start, e.target.value
                                          )
                                      )}/>
                                </TableRowColumn>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Dialog>
        );
    }
}

export default SimulationParametersDialog;
