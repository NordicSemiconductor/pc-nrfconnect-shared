/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentWindow } from '@electron/remote';

import NrfutilDeviceLib from '../../nrfutil/device/device';
import Button from '../Button/Button';
import Card from '../Card/Card';
import {
    getDevices,
    selectedDevice,
    selectedSerialNumber,
} from '../Device/deviceSlice';
import { isLoggingVerbose, setIsLoggingVerbose } from '../Log/logSlice';
import { Toggle } from '../Toggle/Toggle';
import {
    persistIsLoggingVerbose,
    removeIsLoggingVerboseResetHandler,
} from '../utils/persistentStore';
import systemReport from '../utils/systemReport';
import AboutButton from './AboutButton';
import Section from './Section';

export default () => {
    const dispatch = useDispatch();
    const devices = useSelector(getDevices);
    const currentSerialNumber = useSelector(selectedSerialNumber);
    const verboseLogging = useSelector(isLoggingVerbose);
    const currentDevice = useSelector(selectedDevice);

    return (
        <Card title="Support">
            <div className="tw-preflight tw-flex tw-flex-col tw-flex-wrap tw-gap-4">
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
                        employees to know details about your operating system
                        and related software. Create a system report and add to
                        your support request.
                    </p>
                    <AboutButton
                        onClick={() =>
                            systemReport(
                                [...devices.values()],
                                currentSerialNumber as string,
                                currentDevice
                            )
                        }
                        label="Create system report"
                    />
                </Section>
                <Section title="Verbose Logging">
                    <p>
                        Aid our support team with additional log information.
                        Enable this only when necessary as the log will grow
                        quickly.
                    </p>
                    <div className="tw-w-full">
                        <Toggle
                            id="enableVerboseLoggin"
                            label="VERBOSE LOGGING"
                            onToggle={isToggled => {
                                NrfutilDeviceLib.setVerboseLogging(isToggled);
                                persistIsLoggingVerbose(isToggled);
                                dispatch(setIsLoggingVerbose(isToggled));
                            }}
                            isToggled={verboseLogging}
                            variant="primary"
                        />
                    </div>
                    <Section>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                removeIsLoggingVerboseResetHandler();
                                getCurrentWindow().emit('restart-window');
                            }}
                            title="Restart application with verbose logging turned on to get log messages from initial enumeration"
                            disabled={!verboseLogging}
                        >
                            Restart with verbose logging
                        </Button>
                    </Section>
                </Section>
            </div>
        </Card>
    );
};
