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

const getInsights = async (forceSend?: boolean) => {
    if (!usageDataCommon.getShouldSendTelemetry(forceSend)) return;

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
window.addEventListener('beforeunload', async () => {
    (await getInsights())?.flush();
});

const init = async () => {
    const applicationName = packageJson().name;
    const applicationVersion = packageJson().version;
    const source = isLauncher() ? undefined : (await appDetails()).source;

    const accountId = getUsageDataClientId();

    const out = new ApplicationInsights({
        config: {
            instrumentationKey: INSTRUMENTATION_KEY,
            accountId, // to hide with removeAllMetadata
        },
    });

    out.loadAppInsights();

    // Add app name and version to every event
    out.addTelemetryInitializer(envelope => {
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
            envelope.baseData = {
                applicationName,
                applicationVersion,
                isDevelopment,
                source,
                ...envelope.baseData,
            };
        }
    });

    return out;
};

const sendUsageData = async (
    action: string,
    metadata?: Metadata,
    forceSend?: boolean
) => {
    const result = await getInsights(forceSend);
    if (result !== undefined) {
        result.trackEvent(
            {
                name: action,
            },
            forceSend ? { removeAllMetadata: true } : metadata
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
