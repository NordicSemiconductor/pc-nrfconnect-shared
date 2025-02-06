/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import Card from '../Card/Card';
import { deviceInfo } from '../Device/deviceInfo/deviceInfo';
import { selectedDevice, selectedDeviceInfo } from '../Device/deviceSlice';
import AboutButton from './AboutButton';
import Section from './Section';

const memorySize = (memoryInBytes: number) => {
    if (memoryInBytes == null) {
        return 'Unknown';
    }

    return `${memoryInBytes / 1024}KiB`;
};

export default () => {
    const device = useSelector(selectedDevice);
    const info = useSelector(selectedDeviceInfo);

    if (device == null) {
        return (
            <Card title="Device">
                <Section title="No device selected" />
            </Card>
        );
    }

    const pca = device.devkit?.boardVersion;
    const { name, cores, website } = deviceInfo(device);

    return (
        <Card title="Device">
            <div className="tw-preflight tw-flex tw-flex-col tw-flex-wrap tw-gap-4">
                <Section title="Name">{name || 'Unknown'}</Section>
                <Section title="ID">{device.serialNumber}</Section>
                <Section title="PCA">{pca || 'Unknown'}</Section>
                <Section title="Cores">{cores || 'Unknown'}</Section>

                {info?.hwInfo && (
                    <>
                        <Section title="RAM">
                            {memorySize(info.hwInfo.ramSize)}
                        </Section>
                        <Section title="Flash">
                            {memorySize(info.hwInfo.romSize)}
                        </Section>
                    </>
                )}

                <Section>
                    <AboutButton
                        url={website.buyOnline}
                        label="Find distributor"
                    />
                </Section>
                <Section>
                    <AboutButton
                        url={website.productPage}
                        label="Go to product page"
                    />
                </Section>
            </div>
        </Card>
    );
};
