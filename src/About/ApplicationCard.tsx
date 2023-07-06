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
import ShortcutButton from './ShortcutButton';

interface AppDetails {
    coreVersion: string;
    corePath: string;
    homeDir: string;
    tmpDir: string;
}

interface LauncerApp {
    name?: string;
    displayName?: string;
    description?: string;
    homepage?: string;
    currentVersion?: string;
    latestVersion?: string;
    engineVersion?: string;
    path?: string;
    iconPath?: string;
    shortcutIconPath?: string;
    isOfficial?: string;
    sharedVersion?: string;
    source?: string;
    url?: string;
    releaseNote?: string;
    upgradeAvailable?: string;
    repositoryUrl?: string;
}

type DetailsFromLauncher = AppDetails & LauncerApp;

export default () => {
    const [appInfo, setAppInfo] = useState<DetailsFromLauncher>();

    useEffect(() => {
        ipcRenderer.once('app-details', (_, details: DetailsFromLauncher) => {
            setAppInfo(details);
        });
        ipcRenderer.send('get-app-details');
    }, [setAppInfo]);

    if (appInfo == null) return null;

    return (
        <Card title="Application">
            <div className="tw-flex tw-flex-column tw-flex-wrap tw-gap-4">
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
                    <FactoryResetButton label="Restore defaults..." />
                    <ShortcutButton label="Show shortcuts" />
                </Section>
            </div>
        </Card>
    );
};
