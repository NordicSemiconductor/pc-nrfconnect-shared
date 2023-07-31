/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';

import {
    AppDetailsFromLauncher,
    inMain as appDetails,
} from '../../ipc/appDetails';
import Card from '../Card/Card';
import FactoryResetButton from '../FactoryReset/FactoryResetButton';
import AboutButton from './AboutButton';
import Section from './Section';
import ShortcutButton from './ShortcutButton';

export default () => {
    const [appInfo, setAppInfo] = useState<AppDetailsFromLauncher>();

    useEffect(() => {
        appDetails.getAppDetails().then(setAppInfo);
    }, [setAppInfo]);

    if (appInfo == null) return null;

    return (
        <Card title="Application">
            <div className="tw-preflight tw-flex tw-flex-col tw-flex-wrap tw-gap-4">
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
