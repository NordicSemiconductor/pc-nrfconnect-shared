/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../Button/Button';
import Card from '../Card/Card';
import { setVerboseDeviceLibLogging } from '../Device/deviceLibWrapper';
import {
    deviceInfo,
    selectedSerialNumber,
    sortedDevices,
} from '../Device/deviceSlice';
import {
    nrfdlVerboseLoggingEnabled,
    toggleNrflVerboseLogging,
} from '../Log/logSlice';
import { Toggle } from '../Toggle/Toggle';
import { persistVerboseLoggingEnabled } from '../utils/persistentStore';
import systemReport from '../utils/systemReport';
import AboutButton from './AboutButton';
import Section from './Section';

const { getCurrentWindow } = require('@electron/remote');

export default () => {
    const dispatch = useDispatch();
    const devices = useSelector(sortedDevices);
    const currentSerialNumber = useSelector(selectedSerialNumber);
    const verboseLogging = useSelector(nrfdlVerboseLoggingEnabled);
    const currentDevice = useSelector(deviceInfo);

    useEffect(() => {
        persistVerboseLoggingEnabled(false);
    }, []);

    useEffect(() => {
        setVerboseDeviceLibLogging(verboseLogging);
    }, [verboseLogging]);

    return (
        <Card title="Support">
            <Section title="DevZone">
                <p>
                    All support requests must be sent through our developer
                    portal DevZone.
                </p>
                <AboutButton
                    url="https://devzone.nordicsemi.com"
                    label="Go to DevZone"
                />
            </Section>
            <Section title="System report">
                <p>
                    In order to get the best support it is helpful for our
                    employees to know details about your operating system and
                    related software. Create a system report and add to your
                    support request.
                </p>
                <AboutButton
                    onClick={() =>
                        systemReport(
                            devices,
                            currentSerialNumber as string,
                            currentDevice
                        )
                    }
                    label="Create system report"
                />
            </Section>
            <Section title="Verbose Logging">
                <p>
                    Aid our support team with additional log information. Enable
                    this only when necessary as the log will grow quickly.
                </p>
                <Toggle
                    id="enableVerboseLoggin"
                    label="VERBOSE LOGGING"
                    onToggle={() => dispatch(toggleNrflVerboseLogging())}
                    isToggled={verboseLogging}
                    variant="primary"
                />
                <Section>
                    <Button
                        onClick={() => {
                            persistVerboseLoggingEnabled(true);
                            getCurrentWindow().reload();
                        }}
                        title="Restart application with verbose logging turned on to get log messages from initial enumeration"
                        disabled={!verboseLogging}
                    >
                        Restart with verbose logging
                    </Button>
                </Section>
            </Section>
        </Card>
    );
};
