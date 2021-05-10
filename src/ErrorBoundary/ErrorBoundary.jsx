import React from 'react';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import deviceShape from '../Device/DeviceSelector/deviceShape';
import ConfirmationDialog from '../Dialog/ConfirmationDialog';
import Spinner from '../Dialog/Spinner';
import { CollapsibleGroup } from '../SidePanel/Group';
import { openUrl } from '../utils/open';
import packageJson from '../utils/packageJson';
import { getAppSpecificStore as store } from '../utils/persistentStore';
import { generateSystemReport } from '../utils/systemReport';
import {
    getInitializedStatus as isGAInitialized,
    init as initGA,
    sendErrorReport,
} from '../utils/usageData';
import bugIcon from './bug.svg';

import './error-boundary.scss';

const { getCurrentWindow } = require('electron').remote;

const sendGAEvent = async error => {
    const isInitialized = await isGAInitialized();
    if (!isInitialized) {
        await initGA(packageJson());
    }
    sendErrorReport(error);
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            isFactoryResetting: false,
            systemReport: null,
        };
    }

    async componentDidCatch(error) {
        this.setState({
            hasError: true,
            error,
        });
        await sendGAEvent(error.message);

        const { devices, selectedSerialNumber } = this.props;
        generateSystemReport(
            new Date().toISOString().replace(/:/g, '-'),
            Object.values(devices),
            selectedSerialNumber,
            devices[selectedSerialNumber]
        ).then(report => {
            this.setState({ systemReport: report });
        });
    }

    factoryReset = () => {
        store().clear();
        getCurrentWindow().reload();
    };

    render() {
        const {
            hasError,
            error,
            isFactoryResetting,
            systemReport,
        } = this.state;

        const { children } = this.props;

        if (!hasError) {
            return children;
        }

        return (
            <div className="error-boundary__container">
                <div className="error-boundary__header">
                    <h1>Oops! There was a problem</h1>
                    <img src={bugIcon} alt="" />
                </div>
                <div className="error-boundary__main">
                    <div className="error-boundary__info">
                        <b>
                            nRF Connect for Desktop {packageJson().displayName}{' '}
                            experienced an unrecoverable error
                        </b>
                        <p>
                            If this is the first time you've seen this problem
                            we recommend restarting the application.
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => getCurrentWindow().reload()}
                        >
                            Restart application
                        </Button>
                        <p>
                            If restarting didn't help, you can also try
                            restoring to default values.
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => {
                                this.setState({ isFactoryResetting: true });
                            }}
                        >
                            Restore defaults
                        </Button>
                        <ConfirmationDialog
                            isVisible={isFactoryResetting}
                            onOk={this.factoryReset}
                            onCancel={() =>
                                this.setState({ isFactoryResetting: false })
                            }
                        >
                            Restoring defaults will remove all stored
                            configurations. Are you sure you want to proceed?
                        </ConfirmationDialog>
                    </div>
                </div>
                <div className="error-boundary__footer">
                    {error !== null && (
                        <div className="error-boundary__message">
                            <CollapsibleGroup heading="Show detailed error message">
                                <div className="report">
                                    <h4>{error.message}</h4>
                                    <pre>{error.stack}</pre>
                                </div>
                            </CollapsibleGroup>
                        </div>
                    )}
                    <hr />
                    {systemReport !== null ? (
                        <div className="error-boundary__message">
                            <CollapsibleGroup heading="Show system report">
                                <div className="report">
                                    <pre>{systemReport}</pre>
                                </div>
                            </CollapsibleGroup>
                        </div>
                    ) : (
                        <div className="error-boundary__message--loading">
                            <h2 className="loading-header">
                                Generating system report...
                            </h2>
                            <Spinner />
                        </div>
                    )}
                    <p>
                        Please report the problem on DevZone if you have
                        experienced it multiple times
                    </p>
                    <Button
                        variant="primary"
                        onClick={() =>
                            openUrl(
                                'https://devzone.nordicsemi.com/support/add'
                            )
                        }
                        disabled={!systemReport}
                    >
                        Go to DevZone
                    </Button>
                </div>
            </div>
        );
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node,
    selectedSerialNumber: PropTypes.string,
    devices: PropTypes.objectOf(deviceShape),
};

const mapStateToProps = state => ({
    devices: state.device?.devices || {},
    selectedSerialNumber: state.device?.selectedSerialNumber,
});

export default connect(mapStateToProps)(ErrorBoundary);
