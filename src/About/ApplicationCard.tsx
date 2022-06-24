/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { ipcRenderer } from 'electron';

import Card from '../Card/Card';
import FactoryResetButton from '../FactoryReset/FactoryResetButton';
import ShortcutModal from '../Shortcuts/ShortcutModal';
import { Shortcut, shortcuts, useHotKey2 } from '../Shortcuts/useHotkey';
import AboutButton from './AboutButton';
import Section from './Section';

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
    const [isModalVisible, setIsModalVisible] = useState(false);
    const toggleModalVisible = () => setIsModalVisible(!isModalVisible);

    const localshortcuts: Shortcut[] = [];

    // Global hotkey for bringing up the hotkey menu
    useHotKey2({
        hotKey: '?',
        title: 'Shortcuts',
        description: 'Opens/closes this hotkey menu',
        action: () => toggleModalVisible(),
    });

    // Test shortcut only to show UI
    const sc2 = {
        hotKey: 'alt+i',
        title: 'Test title',
        description: 'test description',
        action: () => console.log('test'), // Unbound, won't fire
    };

    localshortcuts.push(sc2);

    useEffect(() => {
        ipcRenderer.once('app-details', (_, details: DetailsFromLauncher) => {
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
                <FactoryResetButton label="Restore defaults..." />
            </Section>
            <Section>
                <Button onClick={toggleModalVisible}>Show shortcuts</Button>
            </Section>
            <ShortcutModal
                globalShortcutList={shortcuts}
                localShortcutList={localshortcuts}
                isVisible={isModalVisible}
                onCancel={toggleModalVisible}
            />
        </Card>
    );
};
