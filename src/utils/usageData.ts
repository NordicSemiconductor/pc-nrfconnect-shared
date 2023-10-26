/*
 * Copyright (c) 2105 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import type Systeminformation from 'systeminformation';
import winston from 'winston';

import { PackageJson } from '../../ipc/schema/packageJson';
import { getAppSource } from './appDirs';
import { isDevelopment } from './environment';
import {
    deleteIsSendingUsageData,
    getIsSendingUsageData,
    getUsageDataClientId,
    persistIsSendingUsageData,
} from './persistentStore';

const instrumentationKey = '4b8b1a39-37c7-479e-a684-d4763c7c647c';

const getFriendlyAppName = (json: PackageJson | undefined) =>
    (json?.name ?? '').replace('pc-nrfconnect-', '');

export interface Metadata {
    [key: string]: unknown;
}

interface EventAction {
    action: string;
    metadata?: Metadata;
}

let eventQueue: EventAction[] = [];
let eventPageViews: string[] = [];
let insights: ApplicationInsights | undefined;

/**
 * Initialize instance to send user data
 *
 * @returns {Promise<void>} void
 */
export const init = () => {
    const appPackageJson = packageJson();
    const applicationName = appPackageJson.name;
    const applicationVersion = appPackageJson.version;

    if (!getIsSendingUsageData()) return;

    const accountId = getUsageDataClientId();

    insights = new ApplicationInsights({
        config: {
            instrumentationKey,
            accountId,
        },
    });

    insights.loadAppInsights();

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
            isDevelopment,
            source: getAppSource(),
        };
    });

    logger?.debug(
        `Application Insights for category ${applicationName} has initialized`
    );

    // Add 5 second delay to prevent inital rendering from beeing frozen.
    setTimeout(async () => {
        // eslint-disable-next-line global-require
        const si = require('systeminformation') as typeof Systeminformation;
        sendUsageData('architecture', { arch: (await si.osInfo()).arch });
    }, 5_000);
};

/**
 * Checks if usage report instance is initialized and ready to be sent
 *
 * @returns {Boolean} returns whether the setting is on, off or undefined
 */
export const isInitialized = () => {
    logger?.debug(
        `Usage report instance is${
            insights !== undefined ? '' : ' not'
        } initialized`
    );
    return insights !== undefined;
};

/**
 * Check the status of usage data
 *
 * @returns {Boolean | undefined} returns whether the setting is on, off or undefined
 */
export const isEnabled = () => {
    const isSendingUsageData = getIsSendingUsageData();
    logger?.debug(`Usage data is ${isSendingUsageData}`);
    return isSendingUsageData;
};

/**
 * Enable sending usage data
 *
 * @returns {void}
 */
export const enable = () => {
    persistIsSendingUsageData(true);
    logger?.debug('Usage data has been enabled');
};

/**
 * Disable sending usage data
 *
 * @returns {void}
 */
export const disable = () => {
    persistIsSendingUsageData(false);
    logger?.debug('Usage data has been disabled');
};

/**
 * Reset settings so that launcher is able to
 * ask the user to enable or disable sending usage data
 *
 * @returns {void}
 */
export const reset = () => {
    deleteIsSendingUsageData();
    logger?.debug('Usage data setting has been reset');
};

/**
 * Send event
 * @param {EventAction} event the event to send
 *
 * @returns {void}
 */
const sendEvent = ({ action, metadata }: EventAction) => {
    const isSendingUsageData = getIsSendingUsageData();

    if (isSendingUsageData && insights !== undefined) {
        logger?.debug(`Sending usage data ${JSON.stringify(action)}`);
        insights.trackEvent(
            {
                name: `${getFriendlyAppName(packageJson())}: ${action}`,
            },
            metadata
        );
    }
};

export const sendUsageData = <T extends string>(
    action: T,
    metadata?: Metadata
) => {
    eventQueue.push({ action, metadata });
    if (!isInitialized()) {
        return;
    }
    eventQueue.forEach(sendEvent);
    eventQueue = [];
};

export const sendPageView = (pageName: string) => {
    eventPageViews.push(pageName);
    if (!isInitialized()) {
        return;
    }
    eventPageViews.forEach(name => {
        insights?.trackPageView({
            name: `${getFriendlyAppName(packageJson())} - ${name}`,
        });
    });
    eventPageViews = [];
};

export const sendMetric = (name: string, average: number) => {
    insights?.trackMetric({
        name,
        average,
    });
};

export const sendTrace = (message: string) => {
    insights?.trackTrace({
        message,
    });
};

/**
 * Send error usage data event to Application Insights and also show it in the logger view
 * @param {string} error The event action
 * @returns {void}
 */
export const sendErrorReport = (error: string) => {
    logger?.error(error);
    insights?.trackException({
        exception: new Error(error),
    });
};

let logger: winston.Logger | undefined;
export const setUsageLogger = (log: winston.Logger) => {
    logger = log;
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
