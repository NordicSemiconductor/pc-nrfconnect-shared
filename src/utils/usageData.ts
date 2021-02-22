/* Copyright (c) 2105 - 2020, Nordic Semiconductor ASA
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

import reactGA from 'react-ga';
/* eslint-disable import/no-unresolved */
import { PackageJson } from 'pc-nrfconnect-shared';
import shasum from 'shasum';
import si from 'systeminformation';

import logger from '../logging';
import {
    deleteIsSendingUsageData,
    getIsSendingUsageData,
    persistIsSendingUsageData,
} from './persistentStore';

const trackId = 'UA-22498474-5';

interface EventAction {
    action: string;
    label: string | undefined;
}

let isInitialized = false;
let appJson: PackageJson;
let eventQueue: EventAction[] = [];

/**
 * Initialize instance to send user data
 * @param {*} packageJson the app's package json
 *
 * @returns {Promise<void>} void
 */
const init = async (packageJson: PackageJson) => {
    appJson = packageJson;

    const networkInterfaces = await si.networkInterfaces();
    let networkInterface = networkInterfaces.find(i => i.iface === 'eth0'); // for most Debian
    networkInterface =
        networkInterface || networkInterfaces.find(i => i.iface === 'en0'); // for most macOS
    networkInterface =
        networkInterface || networkInterfaces.find(i => i.iface === 'Ethernet'); // for most Windows
    networkInterface =
        networkInterface || networkInterfaces.find(i => i.mac && !i.internal); // for good luck
    logger.debug(`iface: ${networkInterface?.iface}`);
    logger.debug(`IP4: ${networkInterface?.ip4}`);
    logger.debug(`IP6: ${networkInterface?.ip6}`);
    logger.debug(`MAC: ${networkInterface?.mac}`);
    const clientId = networkInterface
        ? shasum(
              networkInterface.ip4 ||
                  networkInterface.ip6 + networkInterface.mac
          )
        : 'unknown';
    logger.debug(`Client Id: ${clientId}`);
    reactGA.initialize(trackId, {
        debug: false,
        titleCase: false,
        gaOptions: {
            storage: 'none',
            storeGac: false,
            clientId,
        },
    });

    reactGA.set({
        checkProtocolTask: null,
        // According to Nordic Personal Data Processing Protocol for nRF Connect for Desktop
        // https://projecttools.nordicsemi.no/confluence/display/ISMS/nRF+Connect+for+Desktop
        // we set ip as anonymized in Google Analytics as described on page
        // https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#anonymizeIp
        anonymizeIp: true,
    });

    reactGA.pageview(appJson.name);

    isInitialized = true;
    logger.debug(
        `Google Analytics for category ${appJson.name} has initialized`
    );
};

/**
 * Check the status of usage data
 *
 * @returns {Boolean | undefined} returns whether the setting is on, off or undefined
 */
const isEnabled = () => {
    const isSendingUsageData = getIsSendingUsageData() as boolean | undefined;
    logger.debug(`Usage data is ${isSendingUsageData}`);
    return isSendingUsageData;
};

/**
 * Enable sending usage data
 *
 * @returns {void}
 */
const enable = () => {
    persistIsSendingUsageData(true);
    logger.debug('Usage data has enabled');
};

/**
 * Disable sending usage data
 *
 * @returns {void}
 */
const disable = () => {
    persistIsSendingUsageData(false);
    logger.debug('Usage data has disabled');
};

/**
 * Reset settings so that launcher is able to
 * ask the user to enable or disable sending usage data
 *
 * @returns {void}
 */
const reset = () => {
    deleteIsSendingUsageData();
    logger.debug('Usage data has reset');
};

/**
 * Send event
 * @param {EventAction} event the event to send
 *
 * @returns {void}
 */
const sendEvent = ({ action, label }: EventAction) => {
    const isSendingUsageData = getIsSendingUsageData();
    const category = appJson.name;
    logger.debug('Sending usage data...');
    logger.debug(`Category: ${category}`);
    logger.debug(`Action: ${action}`);
    logger.debug(`Label: ${label}`);
    if (!isSendingUsageData) {
        logger.debug(
            `Usage data has not been sent. isSendingUsageData is set to ${isSendingUsageData}.`
        );
        return;
    }

    reactGA.event({ category, action, label });
    logger.debug(`Usage data has been sent`);
};

/**
 * Send usage data event to Google Analytics
 * @param {string} action The event action
 * @param {string} label The event label
 * @returns {void}
 */
const sendUsageData = <T extends string>(
    action: T,
    label: string | undefined
) => {
    eventQueue.push({ action, label });
    if (!isInitialized) {
        return;
    }
    eventQueue.forEach(sendEvent);
    eventQueue = [];
};

/**
 * Send error usage data event to Google Analytics and also show it in the logger view
 * @param {string} error The event action
 * @returns {void}
 */
const sendErrorReport = (error: string) => {
    logger.error(error);
    sendUsageData(
        'Report error',
        `${process.platform}; ${process.arch}; v${appJson.version}; ${error}`
    );
};

export default {
    init,
    isInitialized,
    enable,
    disable,
    isEnabled,
    reset,
    sendUsageData,
    sendErrorReport,
};
