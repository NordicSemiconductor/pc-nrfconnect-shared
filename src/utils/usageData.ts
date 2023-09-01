/*
 * Copyright (c) 2105 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import type Systeminformation from 'systeminformation';
import winston from 'winston';

import { isDevelopment } from './environment';
import packageJson from './packageJson';
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

let eventQueue: EventAction[] = [];
let insights: ApplicationInsights | undefined;

/**
 * Initialize instance to send user data
 * @param {*} packageJson the app's package json
 *
 * @returns {Promise<void>} void
 */
export const init = () => {
    const applicationName = isDevelopment
        ? `${packageJson().name}-dev`
        : packageJson.name;
    const applicationVersion = packageJson().version;

    if (!getIsSendingUsageData()) return;

    const accountId = getUsageDataClientId();

    insights = new ApplicationInsights({
        config: {
            instrumentationKey,
            accountId,
        },
    });

    insights.loadAppInsights();
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

    logger?.debug(
        `Application Insights for category ${applicationName} has initialized`
    );

    // Add 5 second delay to prevent inital rendering from beeing frozen.
    setTimeout(async () => {
        // eslint-disable-next-line global-require
        const si = require('systeminformation') as typeof Systeminformation;
        sendTrace('architecture', { arch: (await si.osInfo()).arch });
    }, 5_000);

    // Instrument fetch
    const originalFetch = window.fetch;
    window.fetch = (...params: Parameters<typeof window.fetch>) => {
        const request = originalFetch(...params);
        sendDependency(request);
        return request;
    };
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
const sendEvent = ({ action, label }: EventAction) => {
    const isSendingUsageData = getIsSendingUsageData();

    if (isSendingUsageData && insights !== undefined) {
        logger?.debug(`Sending usage data ${action} ${label}`);
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
const sendUsageData = <T extends string>(action: T, label?: string) => {
    eventQueue.push({ action, label });
    if (!isInitialized()) {
        return;
    }
    eventQueue.forEach(sendEvent);
    eventQueue = [];
};

const sendMetric = (
    name: string,
    average: number,
    props?: Record<string, string>
) => {
    insights?.trackMetric(
        {
            name,
            average,
        },
        props
    );
};

const sendTrace = (message: string, props?: Record<string, string>) => {
    insights?.trackTrace(
        {
            message,
        },
        props
    );
};

const sendDependency = (request: Promise<Response>) => {
    const now = performance.now();

    request.then(response => {
        insights?.trackDependencyData({
            id: response.url,
            responseCode: response.status,
            duration: performance.now() - now,
        });
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
    sendMetric,
    sendTrace,
};
