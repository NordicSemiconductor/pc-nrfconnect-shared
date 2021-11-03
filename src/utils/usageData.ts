/*
 * Copyright (c) 2105 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import reactGA from 'react-ga';
import { PackageJson } from 'pc-nrfconnect-shared'; // eslint-disable-line import/no-unresolved -- This is only importing a type and TypeScript can handle this
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

let initialized = false;
let appJson: PackageJson;
let eventQueue: EventAction[] = [];

/**
 * Initialize instance to send user data
 * @param {*} packageJson the app's package json
 *
 * @returns {Promise<void>} void
 */
export const init = async (packageJson: PackageJson) => {
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

    initialized = true;
    logger.debug(
        `Google Analytics for category ${appJson.name} has initialized`
    );
};

/**
 * Checks if usage report instance is initialized and ready to be sent
 *
 * @returns {Boolean} returns whether the setting is on, off or undefined
 */
export const isInitialized = () => {
    logger.debug(
        `Usage report instance is${initialized ? '' : ' not'} initialized`
    );
    return initialized;
};

/**
 * Check the status of usage data
 *
 * @returns {Boolean | undefined} returns whether the setting is on, off or undefined
 */
export const isEnabled = () => {
    const isSendingUsageData = getIsSendingUsageData() as boolean | undefined;
    logger.debug(`Usage data is ${isSendingUsageData}`);
    return isSendingUsageData;
};

/**
 * Enable sending usage data
 *
 * @returns {void}
 */
export const enable = () => {
    persistIsSendingUsageData(true);
    logger.debug('Usage data has enabled');
};

/**
 * Disable sending usage data
 *
 * @returns {void}
 */
export const disable = () => {
    persistIsSendingUsageData(false);
    logger.debug('Usage data has disabled');
};

/**
 * Reset settings so that launcher is able to
 * ask the user to enable or disable sending usage data
 *
 * @returns {void}
 */
export const reset = () => {
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
export const sendUsageData = <T extends string>(
    action: T,
    label: string | undefined
) => {
    eventQueue.push({ action, label });
    if (!initialized) {
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
export const sendErrorReport = (error: string) => {
    logger.error(error);
    sendUsageData(
        'Report error',
        `${process.platform}; ${process.arch}; v${appJson.version}; ${error}`
    );
};
