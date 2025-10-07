/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentWindow } from '@electron/remote';

import Button from '../Button/Button';
import Card from '../Card/Card';
import {
    getDevices,
    selectedDevice,
    selectedSerialNumber,
} from '../Device/deviceSlice';
import { isLoggingVerbose, setIsLoggingVerbose } from '../Log/logSlice';
import { Toggle } from '../Toggle/Toggle';
import { doNotResetVerboseLogginOnRestart } from '../utils/persistentStore';
import systemReport from '../utils/systemReport';
import AboutButton from './AboutButton';
import Feedback from './Feedback';
import Section from './Section';

export default ({ feedbackCategories }: { feedbackCategories?: string[] }) => {
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
                        You can ask for help or open a support request on
                        DevZone, Nordic Semiconductor&apos;s developer portal.
                    </p>
                    <AboutButton
                        url="https://devzone.nordicsemi.com"
                        label="Go to DevZone"
                    />
                </Section>
                <Section title="System report">
                    <p>
                        Provide details about your operating system and related
                        software to get the best possible assistance. Create a
                        system report and add it to your support request.
                    </p>
                    <AboutButton
                        onClick={() =>
                            systemReport(
                                [...devices.values()],
                                currentSerialNumber as string,
                                currentDevice,
                            )
                        }
                        label="Create system report"
                    />
                </Section>
                <Section title="Other feedback">
                    <p>
                        Provide feedback about how to improve this and other nRF
                        Connect for Desktop applications.
                    </p>
                    <Feedback categories={feedbackCategories} />
                </Section>
                <Section title="Verbose logging">
                    <p>
                        Provide additional log information in your support
                        request. Enable this only when necessary, as the log
                        will grow quickly.
                    </p>
                    <div className="tw-w-full">
                        <Toggle
                            id="enableVerboseLoggin"
                            label="Verbose Logging"
                            onToggle={isToggled =>
                                dispatch(setIsLoggingVerbose(isToggled))
                            }
                            isToggled={verboseLogging}
                            variant="primary"
                        />
                    </div>
                    <Section>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                doNotResetVerboseLogginOnRestart();
                                getCurrentWindow().emit('restart-window');
                            }}
                            title="Restart application with verbose logging enabled to get log messages from the initial enumeration."
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
