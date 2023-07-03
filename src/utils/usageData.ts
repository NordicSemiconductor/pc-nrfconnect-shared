/*
 * Copyright (c) 2105 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import type Systeminformation from 'systeminformation';

import logger from '../logging';
import type { PackageJson } from './AppTypes';
import { isDevelopment } from './environment';
import {
    deleteIsSendingUsageData,
    getIsSendingUsageData,
    getUsageDataClientId,
    persistIsSendingUsageData,
} from './persistentStore';

const instrumentationKey = '4b8b1a39-37c7-479e-a684-d4763c7c647c';

interface EventAction {
    action: string;
    label?: string;
}

let initialized = false;
let eventQueue: EventAction[] = [];
let insights: ApplicationInsights;

/**
 * Initialize instance to send user data
 * @param {*} packageJson the app's package json
 *
 * @returns {Promise<void>} void
 */
export const init = (packageJson: PackageJson) => {
    const applicationName = isDevelopment
        ? `${packageJson.name}-dev`
        : packageJson.name;
    const applicationVersion = packageJson.version;

    if (!getIsSendingUsageData()) return;

    const accountId = getUsageDataClientId();

    insights = new ApplicationInsights({
        config: {
            instrumentationKey,
            accountId,
        },
    });

    insights.loadAppInsights();
    initialized = true;
    insights.trackPageView({ name: applicationName });

    // Add app name and version to every event
    insights.addTelemetryInitializer(envelope => {
        const trace = {
            ...(envelope.ext?.trace ?? {}),
            name: applicationName,
        };
        envelope.ext = { ...envelope.ext, trace };
        envelope.data = {
            ...envelope.data,
            applicationName,
            applicationVersion,
        };
    });

    logger.debug(
        `Application Insights for category ${applicationName} has initialized`
    );

    // Add 5 second delay to prevent inital rendering from beeing frozen.
    setTimeout(async () => {
        // eslint-disable-next-line global-require
        const si = require('systeminformation') as typeof Systeminformation;
        sendUsageData('architecture', (await si.osInfo()).arch);
    }, 5_000);
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

    if (isSendingUsageData) {
        logger.debug(`Sending usage data ${action} ${label}`);
        insights.trackEvent({
            name: action,
            properties: label ? { label } : undefined,
        });
    }
};

/**
 * Send usage data event to Application Insights
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
 * Send error usage data event to Application Insights and also show it in the logger view
 * @param {string} error The event action
 * @returns {void}
 */
export const sendErrorReport = (error: string) => {
    logger.error(error);
    insights.trackException({
        exception: new Error(error),
    });
    sendUsageData(
        'Report error',
        `${process.platform}; ${process.arch}; ${error}`
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
