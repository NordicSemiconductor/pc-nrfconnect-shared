/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import Card from '../Card/Card';
import { deviceInfo as getDeviceInfo } from '../Device/deviceInfo/deviceInfo';
import {
    deviceInfo,
    selectedSerialNumber,
    sortedDevices,
} from '../Device/deviceSlice';
import { Device } from '../state';
import systemReport from '../utils/systemReport';
import AboutButton from './AboutButton';
import Section from './Section';

export default () => {
    const devices = useSelector(sortedDevices);
    const currentSerialNumber = useSelector(selectedSerialNumber);
    const currentDevice = useSelector(deviceInfo);

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
                    suport request.
                </p>
                <AboutButton
                    onClick={() =>
                        systemReport(
                            devices,
                            currentSerialNumber as string,
                            getDeviceInfo(currentDevice as Device)
                        )
                    }
                    label="Create system report"
                />
            </Section>
        </Card>
    );
};
