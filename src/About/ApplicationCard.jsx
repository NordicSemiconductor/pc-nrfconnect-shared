/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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
