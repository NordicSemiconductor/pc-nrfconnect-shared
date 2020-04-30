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

import React from 'react';
import { useSelector } from 'react-redux';
import AboutButton from './AboutButton';
import Card from './Card';
import Section from './Section';

import { selectedDevice, deviceInfo as deviceInfoSelector } from '../Device/deviceReducer';
import {
    cores, deviceName, productPageUrl, buyOnlineUrl,
} from '../Device/device';

const name = device => {
    if (deviceName(device.boardVersion)) {
        return deviceName(device.boardVersion);
    }

    if (device.usb && device.usb.product) {
        return device.usb.product;
    }

    return null;
};

const memorySize = memoryInBytes => {
    if (memoryInBytes == null) {
        return 'Unknown';
    }

    return `${memoryInBytes / 1024}KiB`;
};

export default () => {
    const device = useSelector(selectedDevice);
    const deviceInfo = useSelector(deviceInfoSelector) || {};

    if (device == null) {
        return <Card title="Device"><Section title="No device selected" /></Card>;
    }

    const pca = device.boardVersion;

    return (
        <Card title="Device">
            <Section title="Name">{name(device) || 'Unknown'}</Section>
            <Section title="ID">{device.serialNumber}</Section>
            <Section title="PCA">{pca || 'Unknown'}</Section>
            <Section title="Cores">{cores(pca) || 'Unknown'}</Section>
            <Section title="RAM">{memorySize(deviceInfo.ramSize)}</Section>
            <Section title="Flash">{memorySize(deviceInfo.codeSize)}</Section>
            <Section><AboutButton url={buyOnlineUrl(pca)} label="Find distributor" /></Section>
            <Section><AboutButton url={productPageUrl(pca)} label="Go to product page" /></Section>
        </Card>
    );
};
