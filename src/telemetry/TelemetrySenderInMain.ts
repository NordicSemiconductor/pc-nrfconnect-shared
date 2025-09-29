/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { TelemetryClient } from 'applicationinsights';

import { isDevelopment } from '../utils/environment';
import { packageJson } from '../utils/packageJson';
import TelemetryMetadata from './TelemetryMetadata';
import TelemetrySender from './TelemetrySender';

export default class TelemetrySenderInMain extends TelemetrySender {
    client?: TelemetryClient;

    initClient() {
        const appPackageJson = packageJson();
        const applicationName = appPackageJson.name;
        const applicationVersion = appPackageJson.version;

        this.client = new TelemetryClient(this.INSTRUMENTATION_KEY);
        this.client.config.enableAutoCollectConsole = false;
        this.client.config.enableAutoCollectDependencies = false;
        this.client.config.enableAutoCollectExceptions = false;
        this.client.config.enableAutoCollectIncomingRequestAzureFunctions = false;
        this.client.config.enableAutoCollectHeartbeat = false;
        this.client.config.enableAutoCollectPerformance = false;
        this.client.config.enableAutoCollectPreAggregatedMetrics = false;
        this.client.config.enableAutoCollectRequests = false;
        this.client.config.enableAutoDependencyCorrelation = false;

        // Add app name and version to every event
        this.client.addTelemetryProcessor(envelope => {
            if (envelope.data.baseData?.properties.removeAllMetadata) {
                envelope.tags = [];
                envelope.data.baseData = {
                    name: envelope.data?.baseData.name,
                };
            } else {
                envelope.tags['ai.cloud.roleInstance'] = undefined; // remove PC name
                if (envelope.data.baseData) {
                    envelope.data.baseData.properties = {
                        applicationName,
                        applicationVersion,
                        isDevelopment,
                        ...envelope.data.baseData.properties,
                    };
                }
            }

            return true;
        });

        return this.client;
    }

    getClient = () => this.client ?? this.initClient();

    sendEvent = (action: string, metadata?: TelemetryMetadata) => {
        this.getClient().trackEvent({ name: action, properties: metadata });
        this.logger?.debug(`Sending event ${JSON.stringify(action)}`);
    };

    sendPageView = (pageName: string) =>
        this.getClient().trackPageView({ name: pageName });

    sendMetric = (name: string, value: number) =>
        this.getClient().trackMetric({ name, value });

    sendTrace = (message: string) => this.getClient().trackTrace({ message });

    sendErrorReport = (error: Error) => {
        this.getClient().trackException({ exception: error });
        this.logger?.error(error);
    };

    flush = () => this.getClient().flush();

    stop(): void {
        if (this.client) {
            this.client.config.disableAppInsights = true;
        }
        this.client = undefined;
    }
}
