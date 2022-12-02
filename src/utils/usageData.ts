/*
 * Copyright (c) 2105 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import reactGA from 'react-ga';
import type Systeminformation from 'systeminformation';

import logger from '../logging';
import { PackageJson } from './AppTypes';
import { isDevelopment } from './environment';
import {
    deleteIsSendingUsageData,
    getIsSendingUsageData,
    getUsageDataClientId,
    persistIsSendingUsageData,
} from './persistentStore';

const trackId = 'UA-22498474-5';
const categoryName = () =>
    isDevelopment ? `${appJson.name}-dev` : appJson.name;

interface EventAction {
    action: string;
    label?: string;
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
export const init = (packageJson: PackageJson) => {
    appJson = packageJson;

    if (!getIsSendingUsageData()) return;

    setTimeout(async () => {
        const clientId = getUsageDataClientId();

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

        // eslint-disable-next-line global-require
        const si = require('systeminformation') as typeof Systeminformation;
        sendUsageData('architecture', (await si.osInfo()).arch);

        initialized = true;
        logger.debug(
            `Google Analytics for category ${categoryName()} has initialized`
        );
    }, 5000); // Add 5 second delay to prevent inital rendering from beeing frozen.
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
    const isSendingUsageData = getIsSendingUsageData();
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
    const category = categoryName();

    if (isSendingUsageData) {
        const data = JSON.stringify({ category, action, label });
        logger.debug(`Sending usage data ${data}`);
        reactGA.event({ category, action, label });
    }
};

/**
 * Send usage data event to Google Analytics
 * @param {string} action The event action
 * @param {string} label The event label
 * @returns {void}
 */
export const sendUsageData = <T extends string>(action: T, label?: string) => {
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
        `${process.platform}; ${process.arch}; v${appJson?.version}; ${error}`
    );
};

export default {
    disable,
    enable,
    init,
    isEnabled,
    isInitialized,
    reset,
    sendErrorReport,
    sendUsageData,
};
