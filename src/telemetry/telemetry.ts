/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Logger } from 'winston';

import { packageJson } from '../utils/packageJson';
import flatObject from './flatObject';
import TelemetryMetadata from './TelemetryMetadata';
import TelemetrySender from './TelemetrySender';
import TelemetrySenderInMain from './TelemetrySenderInMain';
import TelemetrySenderInRenderer from './TelemetrySenderInRenderer';

const isRenderer = process && process.type === 'renderer';

let cachedSender: TelemetrySender | undefined;

const newTelemetrySender = () => {
    cachedSender = isRenderer
        ? new TelemetrySenderInRenderer()
        : new TelemetrySenderInMain();

    return cachedSender;
};

// We experienced that apps sometimes freeze when closing the window
// until the telemetry events are sent. But as far as we observed so
// far this only happens in the renderer processes
if (isRenderer) {
    globalThis.addEventListener('beforeunload', () => cachedSender?.flush());
}

const getTelemetrySenderUnconditionally = () =>
    cachedSender ?? newTelemetrySender();

const getTelemetrySenderIfEnabled = () => {
    const sender = getTelemetrySenderUnconditionally();

    if (sender.getIsSendingTelemetry()) return sender;

    return undefined;
};

// Functions which can always be called

const setLogger = (logger: Logger) =>
    getTelemetrySenderUnconditionally().setLogger(logger);
const enable = () => getTelemetrySenderUnconditionally().enable();
const isEnabled = () => getTelemetrySenderUnconditionally().isEnabled();
const disable = () => getTelemetrySenderUnconditionally().disable();
const reset = () => getTelemetrySenderUnconditionally().reset();
const enableTelemetry = () =>
    getTelemetrySenderUnconditionally().allowTelemetryForCurrentApp();

// Functions which will be no-ops if telemetry is disabled for some reason

const getFriendlyAppName = () =>
    packageJson().name.replace('pc-nrfconnect-', '');

const sendUsageData = (action: string, metadata?: TelemetryMetadata) =>
    getTelemetrySenderIfEnabled()?.sendUsageData(
        `${getFriendlyAppName()}: ${action}`,
        flatObject(metadata)
    );

const sendPageView = (pageName: string) =>
    getTelemetrySenderIfEnabled()?.sendPageView(
        `${getFriendlyAppName()} - ${pageName}`
    );

const sendMetric = (name: string, average: number) =>
    getTelemetrySenderIfEnabled()?.sendMetric(name, average);

const sendTrace = (message: string) =>
    getTelemetrySenderIfEnabled()?.sendTrace(message);

const sendErrorReport = (error: string | Error) =>
    getTelemetrySenderIfEnabled()?.sendErrorReport(
        typeof error === 'string' ? new Error(error) : error
    );

export default {
    setLogger,
    disable,
    enable,
    isEnabled,
    reset,
    sendErrorReport,
    sendUsageData,
    sendPageView,
    sendMetric,
    sendTrace,
    enableTelemetry,
};
