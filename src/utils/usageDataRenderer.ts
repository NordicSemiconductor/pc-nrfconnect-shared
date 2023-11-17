/*
 * Copyright (c) 2105 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ApplicationInsights } from '@microsoft/applicationinsights-web';

import appDetails from './appDetails';
import { isDevelopment } from './environment';
import { isLauncher, packageJson } from './packageJson';
import { getUsageDataClientId } from './persistentStore';
import usageDataCommon, {
    INSTRUMENTATION_KEY,
    Metadata,
} from './usageDataCommon';

let cachedInsights: ApplicationInsights | undefined;

const getInsights = async (sendingOptOut?: boolean) => {
    if (!usageDataCommon.getShouldSendTelemetry(sendingOptOut)) return;

    if (cachedInsights) {
        return cachedInsights;
    }

    if (!cachedInsights) {
        cachedInsights = await init();
    }

    return cachedInsights;
};

// We experienced that apps sometimes freeze when closing the window
// until the telemetry events are sent.
const isRenderer = process && process.type === 'renderer';
if (isRenderer) {
    window.addEventListener('beforeunload', async () => {
        (await getInsights())?.flush();
    });
}

const init = async () => {
    const applicationName = packageJson().name;
    const applicationVersion = packageJson().version;
    const source = isLauncher() ? undefined : (await appDetails()).source;

    const accountId = getUsageDataClientId();

    const result = new ApplicationInsights({
        config: {
            instrumentationKey: INSTRUMENTATION_KEY,
            accountId, // to hide with removeAllMetadata
            isStorageUseDisabled: true, // fix issue with duplicate events being sent https://github.com/microsoft/ApplicationInsights-JS/issues/796
            namePrefix: applicationName, // fix issue with duplicate events being sent https://github.com/microsoft/ApplicationInsights-JS/issues/796
        },
    });

    result.loadAppInsights();

    // Add app name and version to every event
    result.addTelemetryInitializer(envelope => {
        if (envelope.data?.removeAllMetadata) {
            envelope.data = {};
            envelope.baseData = { name: envelope.baseData?.name };
            envelope.ext = {};
            envelope.tags = [];
        } else {
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
                source,
            };
        }
    });

    return result;
};

const sendUsageData = async (
    action: string,
    metadata?: Metadata,
    sendingOptOut?: boolean
) => {
    const result = await getInsights(sendingOptOut);
    if (result !== undefined) {
        result.trackEvent(
            {
                name: action,
            },
            sendingOptOut ? { removeAllMetadata: true } : metadata
        );
        return true;
    }

    return false;
};

const sendPageView = async (pageName: string) => {
    (await getInsights())?.trackPageView({
        name: pageName,
    });
};

const sendMetric = async (name: string, average: number) => {
    (await getInsights())?.trackMetric({
        name,
        average,
    });
};

const sendTrace = async (message: string) => {
    (await getInsights())?.trackTrace({
        message,
    });
};

const sendErrorReport = async (error: Error) => {
    (await getInsights())?.trackException({
        exception: error,
    });
};

export default {
    sendErrorReport,
    sendUsageData,
    sendPageView,
    sendMetric,
    sendTrace,
};
