import React from 'react';
import log from 'loglevel';
import Dialog from 'material-ui/Dialog';

class SimulationSettingsDialog extends React.Component {

    constructor(props) {
        super(props);
    }

    render = () => {
        return (
            <Dialog
                title="Settings"
                modal={false}
                open={this.props.open}
                onRequestClose={this.props.onClose}
            >
                123
            </Dialog>
        );
    }
}

export default SimulationSettingsDialog;
