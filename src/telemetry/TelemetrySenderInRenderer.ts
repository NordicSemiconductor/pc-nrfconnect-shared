/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ApplicationInsights } from '@microsoft/applicationinsights-web';

import appDetails from '../utils/appDetails';
import { isDevelopment } from '../utils/environment';
import { isLauncher, packageJson } from '../utils/packageJson';
import { getTelemetryClientId } from '../utils/persistentStore';
import TelemetryMetadata from './TelemetryMetadata';
import TelemetrySender from './TelemetrySender';

export default class TelemetrySenderInRenderer extends TelemetrySender {
    client?: ApplicationInsights;

    async initClient() {
        const source = isLauncher() ? undefined : (await appDetails()).source;

        const applicationName = packageJson().name;
        const applicationVersion = packageJson().version;

        const accountId = getTelemetryClientId();

        this.client = new ApplicationInsights({
            config: {
                instrumentationKey: this.INSTRUMENTATION_KEY,
                accountId, // to hide with removeAllMetadata
                isStorageUseDisabled: true, // fix issue with duplicate events being sent https://github.com/microsoft/ApplicationInsights-JS/issues/796
                namePrefix: applicationName, // fix issue with duplicate events being sent https://github.com/microsoft/ApplicationInsights-JS/issues/796
            },
        });

        this.client.loadAppInsights();

        // Add app name and version to every event
        this.client.addTelemetryInitializer(envelope => {
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

        return this.client;
    }

    getClient = () => this.client ?? this.initClient();

    sendUsageData = async (action: string, metadata?: TelemetryMetadata) => {
        (await this.getClient()).trackEvent({ name: action }, metadata);
        this.logger?.debug(`Sending usage data ${JSON.stringify(action)}`);
    };

    sendPageView = async (pageName: string) =>
        (await this.getClient()).trackPageView({ name: pageName });

    sendMetric = async (name: string, average: number) =>
        (await this.getClient()).trackMetric({ name, average });

    sendTrace = async (message: string) =>
        (await this.getClient()).trackTrace({ message });

    sendErrorReport = async (error: Error) => {
        (await this.getClient()).trackException({ exception: error });
        this.logger?.error(error);
    };

    flush = async () => (await this.getClient()).flush();
}
