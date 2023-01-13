/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getCurrentWindow } from '@electron/remote';

import Spinner from '../Dialog/Spinner';
import FactoryResetButton from '../FactoryReset/FactoryResetButton';
import { CollapsibleGroup } from '../SidePanel/Group';
import { Device, RootState } from '../state';
import { openUrl } from '../utils/open';
import packageJson from '../utils/packageJson';
import { getAppSpecificStore as store } from '../utils/persistentStore';
import { generateSystemReport } from '../utils/systemReport';
import {
    init as initGA,
    isEnabled,
    isInitialized as isGAInitialized,
    sendErrorReport,
} from '../utils/usageData';
import bugIcon from './bug.svg';

import './error-boundary.scss';

const sendGAEvent = (error: string) => {
    if (!isEnabled()) {
        return;
    }
    if (!isGAInitialized()) {
        initGA(packageJson());
    }
    sendErrorReport(error);
};

interface Props {
    children: ReactNode;
    selectedSerialNumber?: string;
    devices: Map<string, Device>;
    appName?: string;
    restoreDefaults?: () => void;
    sendUsageData?: (message: string) => void;
}

const genericRestoreDefaults = () => {
    store().clear();
    getCurrentWindow().reload();
};

class ErrorBoundary extends React.Component<
    Props,
    { hasError: boolean; error: Error | null; systemReport: string | null }
> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            systemReport: null,
        };
    }

    static getDerivedStateFromError(error: Error) {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error) {
        const { devices, selectedSerialNumber, sendUsageData } = this.props;
        sendUsageData != null
            ? sendUsageData(error.message)
            : sendGAEvent(error.message);

        const selectedDevice =
            selectedSerialNumber == null
                ? undefined
                : devices.get(selectedSerialNumber);

        generateSystemReport(
            new Date().toISOString().replace(/:/g, '-'),
            Object.values(devices) as Device[],
            selectedDevice,
            selectedSerialNumber
        ).then(report => {
            this.setState({ systemReport: report });
        });
    }

    render() {
        const { hasError, error, systemReport } = this.state;

        const { children, appName, restoreDefaults } = this.props;

        if (!hasError) {
            return children;
        }

        const appDisplayName = appName || packageJson().displayName;

        return (
            <div className="error-boundary__container">
                <div className="error-boundary__header">
                    <h1>Oops! There was a problem</h1>
                    <img src={bugIcon} alt="" />
                </div>
                <div className="error-boundary__main">
                    <div className="error-boundary__info">
                        <div className="info-header">
                            nRF Connect for Desktop {appDisplayName} experienced
                            an unrecoverable error
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
                        <FactoryResetButton
                            resetFn={restoreDefaults || genericRestoreDefaults}
                            label="Restore default settings"
                            variant="primary"
                        />
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
                    >
                        Go to DevZone
                    </Button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    devices: state.device.devices,
    selectedSerialNumber: state.device?.selectedSerialNumber ?? undefined,
});

export default connect(mapStateToProps)(ErrorBoundary);
