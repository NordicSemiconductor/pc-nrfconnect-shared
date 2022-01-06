/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { setLogLevel } from '@nordicsemiconductor/nrf-device-lib-js';

import Card from '../Card/Card';
import {
    getDeviceLibContext,
    setDefaultNrfdlLogLevel,
} from '../Device/deviceLister';
import {
    deviceInfo,
    selectedSerialNumber,
    sortedDevices,
} from '../Device/deviceSlice';
import { Toggle } from '../Toggle/Toggle';
import {
    getExtendedLoggingEnabled,
    persistExtendedLoggingEnabled,
} from '../utils/persistentStore';
import systemReport from '../utils/systemReport';
import AboutButton from './AboutButton';
import Section from './Section';

import colors from '../utils/colors.icss.scss';

const { getCurrentWindow } = require('electron').remote;

export default () => {
    const devices = useSelector(sortedDevices);
    const currentSerialNumber = useSelector(selectedSerialNumber);
    const currentDevice = useSelector(deviceInfo);
    const [extendedLogging, setExtendedLogging] = useState(
        getExtendedLoggingEnabled()
    );
    persistExtendedLoggingEnabled(false);

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
            <Section title="Extended Logging">
                <p>
                    Aid our support team with additional log information. Enable
                    this only when necessary as it will fill up the log quickly.
                    This setting is not persisted.
                </p>
                <Toggle
                    id="enableExtendedLoggin"
                    label="EXTENDED LOGGING"
                    onToggle={() => {
                        if (!extendedLogging)
                            setLogLevel(
                                getDeviceLibContext(),
                                'NRFDL_LOG_TRACE'
                            );
                        else setDefaultNrfdlLogLevel();
                        setExtendedLogging(!extendedLogging);
                    }}
                    isToggled={extendedLogging}
                    variant="primary"
                    handleColor={colors.white}
                    barColor={colors.gray700}
                    barColorToggled={colors.nordicBlue}
                />
                <Section>
                    <AboutButton
                        onClick={() => {
                            persistExtendedLoggingEnabled(true);
                            getCurrentWindow().reload();
                        }}
                        label="Restart with extended logging"
                    />
                </Section>
            </Section>
        </Card>
    );
};
