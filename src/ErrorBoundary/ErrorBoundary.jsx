import React from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

import ConfirmationDialog from '../Dialog/ConfirmationDialog';
import { CollapsibleGroup } from '../SidePanel/Group';
import { openUrl } from '../utils/open';
import { getAppSpecificStore as store } from '../utils/persistentStore';
import { sendErrorReport } from '../utils/usageData';
import bugIcon from './bug.svg';

import './error-boundary.scss';

const { getCurrentWindow } = require('electron').remote;

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            isFactoryResetting: false,
        };
    }

    componentDidCatch(error) {
        this.setState({
            hasError: true,
            error,
        });
        sendErrorReport(error.message);
    }

    factoryReset = () => {
        store().clear();
        getCurrentWindow().reload();
    };

    render() {
        const { hasError, error, isFactoryResetting } = this.state;
        const { children } = this.props;
        if (hasError) {
            return (
                <div className="error-boundary__container">
                    <div className="error-boundary__header">
                        <h1>Oops! There was a problem</h1>
                        <img src={bugIcon} alt="" />
                    </div>
                    <div className="error-boundary__main">
                        <div className="error-boundary__info">
                            {
                                // Add app name to this string
                            }
                            <b>
                                nRF Connect for Desktop experienced an
                                unrecoverable error
                            </b>
                            <p>
                                If this is the first time you've seen this
                                problem we recommend restarting the application.
                            </p>
                            <Button
                                variant="primary"
                                onClick={() => getCurrentWindow().reload()}
                            >
                                Restart application
                            </Button>

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
                                configurations. Are you sure you want to
                                proceed?
                            </ConfirmationDialog>
                        </div>
                    </div>
                    <div className="error-boundary__footer">
                        {error !== null && (
                            <div className="error-boundary__message">
                                <h4>Error message</h4>
                                <CollapsibleGroup heading="Show detailed error message">
                                    <div className="stacktrace">
                                        <h4>{error.message}</h4>
                                        <p>{error.stack}</p>
                                    </div>
                                </CollapsibleGroup>
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
                        >
                            Report problem
                        </Button>
                    </div>
                </div>
            );
        }

        return children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node,
};

export default ErrorBoundary;
