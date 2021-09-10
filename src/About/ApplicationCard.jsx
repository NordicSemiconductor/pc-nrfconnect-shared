/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';

import Card from '../Card/Card';
import FactoryResetButton from '../FactoryReset/FactoryResetButton';
import AboutButton from './AboutButton';
import Section from './Section';

export default () => {
    const [appInfo, setAppInfo] = useState();

    useEffect(() => {
        ipcRenderer.once('app-details', (_, details) => {
            setAppInfo(details);
        });
        ipcRenderer.send('get-app-details');
    }, [setAppInfo]);

    if (appInfo == null) return null;

    return (
        <Card title="Application">
            <Section title="Title">{appInfo.displayName}</Section>
            <Section title="Purpose">{appInfo.description}</Section>
            <Section title="Version">{appInfo.currentVersion}</Section>
            <Section title="Source">{appInfo.source || 'local'}</Section>
            <Section title="Supported engines">
                nRF Connect {appInfo.engineVersion}
            </Section>
            <Section title="Current engine">
                nRF Connect {appInfo.coreVersion}
            </Section>
            <Section>
                <AboutButton
                    url={appInfo.repositoryUrl}
                    label="Get source code"
                />
            </Section>
            <Section>
                <FactoryResetButton
                    label="Restore defaults..."
                    classNames="w-100"
                    variant="secondary"
                />
            </Section>
        </Card>
    );
};
