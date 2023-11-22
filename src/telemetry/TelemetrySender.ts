/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import si from 'systeminformation';
import { Logger } from 'winston';

import {
    deleteHasUserAgreedToTelemetry,
    getHasUserAgreedToTelemetry,
    persistHasUserAgreedToTelemetry,
} from '../utils/persistentStore';
import TelemetryMetadata from './TelemetryMetadata';

type MaybePromise<T> = T | Promise<T>;

export default abstract class TelemetrySender {
    readonly INSTRUMENTATION_KEY = '4b8b1a39-37c7-479e-a684-d4763c7c647c';

    logger?: Logger;
    setLogger = (logger: Logger) => {
        this.logger = logger;
    };

    isTelemetryAllowedForCurrentApp = false;
    allowTelemetryForCurrentApp = () => {
        this.isTelemetryAllowedForCurrentApp = true;
    };

    getIsSendingTelemetry = () =>
        this.isTelemetryAllowedForCurrentApp &&
        getHasUserAgreedToTelemetry() === true;

    /**
     * @deprecated Use `getIsSendingTelemetry` instead
     * @returns {boolean} If telemetry is enabled
     */
    isEnabled() {
        const isSendingTelemetry = this.getIsSendingTelemetry();
        this.logger?.debug(`Telemetry is ${isSendingTelemetry}`);

        return isSendingTelemetry;
    }

    async sendAgreementEvent() {
        this.sendUsageData('Telemetry Opt-In');

        const { platform, arch } = await si.osInfo();
        this.sendUsageData('Report OS info', { platform, arch });
    }

    sendDisagreementEvent() {
        this.sendMinimalUsageData('Telemetry Opt-Out');
    }

    async setUsersAgreedToTelemetry(hasAgreed: boolean) {
        persistHasUserAgreedToTelemetry(hasAgreed);

        if (hasAgreed) {
            await this.sendAgreementEvent();
        } else {
            this.sendDisagreementEvent();
        }

        this.logger?.debug(
            `Telemetry has been ${hasAgreed ? 'enabled' : 'disabled'}`
        );
    }

    setUsersWithdrewTelemetryAgreement() {
        deleteHasUserAgreedToTelemetry();
        this.sendMinimalUsageData('Telemetry Opt-Reset');
        this.logger?.debug('Telemetry has been reset');
    }

    sendMinimalUsageData(action: string) {
        this.sendUsageData(action, { removeAllMetadata: true });
    }

    abstract sendUsageData(
        action: string,
        metadata?: TelemetryMetadata
    ): MaybePromise<void>;
    abstract sendPageView(pageName: string): MaybePromise<void>;
    abstract sendMetric(name: string, average: number): MaybePromise<void>;
    abstract sendTrace(message: string): MaybePromise<void>;
    abstract sendErrorReport(error: Error): MaybePromise<void>;
    abstract flush(): MaybePromise<void>;
}
