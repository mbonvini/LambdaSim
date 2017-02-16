import React from 'react';
import log from 'loglevel';

const styles = {
    headline: {
        fontSize: 24,
        paddingTop: 16,
        marginBottom: 12,
        fontWeight: 400,
    },
};

class TabSimulation extends React.Component {

    constructor(props) {
        super(props);
    }

    render = () => {
        return (
            
                <div>
                    <h2 style={styles.headline}>Simulate</h2>
                    <p>
                        This is another example of a controllable tab. Remember, if you
                        use controllable Tabs, you need to give all of your tabs values or else
                        you wont be able to select them.
                    </p>
                </div>
            
        );
    }
}

export default TabSimulation;
