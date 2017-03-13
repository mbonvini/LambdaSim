import React from 'react';
import log from 'loglevel';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import { setInputFile } from '../actions/model-input-actions';

import store from '../store';

const btnStyle = {
  marginTop: 0,
  marginLeft: 10,
  marginRight: 10
};

class SimulationInputsDialog extends React.Component {

    constructor(props) {
        super(props);
        let fileName = null;
        if(this.props.config && this.props.config.model.input_files.length > 0){
            fileName = this.props.config.model.input_files[0];
        }
        this.state = {
            open: false,
            fileName: fileName
        }
    }

    handleOpenDialog = () => {
        this.setState({ open: true });
    };

    handleCloseDialog = () => {
        this.setState({ open: false });
    };

    handleCloseAndSubmit = () => {
        store.dispatch(setInputFile(this.state.fileName));
        this.setState({ open: false });
    };

    handleInputFileChange = (event, index, value) => this.setState({fileName: value});

    render = () => {
        const showButton = this.props.config && this.props.config.model.input_files.length > 0;
        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onTouchTap={this.handleCloseDialog}
            />,
            <FlatButton
                label="OK"
                primary={true}
                keyboardFocused={true}
                onTouchTap={this.handleCloseAndSubmit}
            />,
        ];

        return (
            <div>
                { showButton &&
                    <div>
                        <RaisedButton label='Inputs' secondary={true}
                            onClick={this.handleOpenDialog}
                            style={btnStyle}/>
                        <Dialog
                            title="Input files"
                            modal={false}
                            open={this.state.open}
                            onRequestClose={this.handleCloseDialog}
                            actions={actions}
                        >
                            <SelectField
                                floatingLabelText="Select one of the available input files"
                                value={this.state.fileName}
                                onChange={this.handleInputFileChange}
                                fullWidth={true}
                                >
                                {this.props.config.model.input_files.map((fileName, i) => {
                                    return <MenuItem value={fileName} primaryText={fileName} key={i} />
                                  })
                                }
                            </SelectField>
                        </Dialog>
                    </div>
                }
            </div>
        );
    }
}

export default SimulationInputsDialog;
