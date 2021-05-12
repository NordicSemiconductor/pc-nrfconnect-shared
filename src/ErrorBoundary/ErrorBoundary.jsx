/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
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
    init as initGA,
    isInitialized as isGAInitialized,
    sendErrorReport,
} from '../utils/usageData';
import bugIcon from './bug.svg';

import './error-boundary.scss';

const { getCurrentWindow } = require('electron').remote;

const sendGAEvent = error => {
    if (!isGAInitialized()) {
        initGA(packageJson()).then(() => sendErrorReport(error));
        return;
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

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error) {
        sendGAEvent(error.message);

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
        const { hasError, error, isFactoryResetting, systemReport } =
            this.state;

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
                        <div className="info-header">
                            nRF Connect for Desktop {packageJson().displayName}{' '}
                            experienced an unrecoverable error
                        </div>
                        <p>
                            If this is the first time you&apos;ve seen this
                            problem we recommend restarting the application.
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => getCurrentWindow().reload()}
                        >
                            Restart application
                        </Button>
                        <p>
                            If restarting didn&apos;t help, you can also try
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
    children: PropTypes.node.isRequired,
    selectedSerialNumber: PropTypes.string,
    devices: PropTypes.objectOf(deviceShape),
};

const mapStateToProps = state => ({
    devices: state.device?.devices || {},
    selectedSerialNumber: state.device?.selectedSerialNumber,
});

export default connect(mapStateToProps)(ErrorBoundary);
