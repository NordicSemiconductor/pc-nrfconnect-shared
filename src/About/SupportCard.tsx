/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Card from '../Card/Card';
import {
    deviceInfo,
    selectedSerialNumber,
    sortedDevices,
} from '../Device/deviceSlice';
import { extendedLogging, toggleExtendedLogging } from '../Log/logSlice';
import { Toggle } from '../Toggle/Toggle';
import systemReport from '../utils/systemReport';
import AboutButton from './AboutButton';
import Section from './Section';

import colors from '../utils/colors.icss.scss';

export default () => {
    const dispatch = useDispatch();
    const devices = useSelector(sortedDevices);
    const currentSerialNumber = useSelector(selectedSerialNumber);
    const currentDevice = useSelector(deviceInfo);
    const enableExtendedLogging = useSelector(extendedLogging);

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
                </p>
                <Toggle
                    id="enableExtendedLoggin"
                    label="EXTENDED LOGGING"
                    onToggle={() => dispatch(toggleExtendedLogging())}
                    isToggled={enableExtendedLogging}
                    variant="primary"
                    handleColor={colors.white}
                    barColor={colors.gray700}
                    barColorToggled={colors.nordicBlue}
                />
            </Section>
        </Card>
    );
};
