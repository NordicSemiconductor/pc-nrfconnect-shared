/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import si from 'systeminformation';
import { type Logger } from 'winston';

import {
    deleteHasUserAgreedToTelemetry,
    getHasUserAgreedToTelemetry,
    persistHasUserAgreedToTelemetry,
} from '../utils/persistentStore';
import type TelemetryMetadata from './TelemetryMetadata';

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

    async sendAgreementEvent() {
        this.sendEvent('Telemetry Opt-In');

        const { platform, arch } = await si.osInfo();
        this.sendEvent('Report OS info', { platform, arch });
    }

    sendDisagreementEvent() {
        this.sendMinimalEvent('Telemetry Opt-Out');
        this.flush();
        this.stop();
    }

    async setUsersAgreedToTelemetry(hasAgreed: boolean) {
        persistHasUserAgreedToTelemetry(hasAgreed);

        if (hasAgreed) {
            await this.sendAgreementEvent();
        } else {
            this.sendDisagreementEvent();
        }

        this.logger?.debug(
            `Telemetry has been ${hasAgreed ? 'enabled' : 'disabled'}`,
        );
    }

    setUsersWithdrewTelemetryAgreement() {
        deleteHasUserAgreedToTelemetry();
        this.sendMinimalEvent('Telemetry Opt-Reset');
        this.logger?.debug('Telemetry has been reset');
    }

    sendMinimalEvent(action: string) {
        this.sendEvent(action, { removeAllMetadata: true });
    }

    abstract sendEvent(
        action: string,
        metadata?: TelemetryMetadata,
    ): MaybePromise<void>;
    abstract sendPageView(pageName: string): MaybePromise<void>;
    abstract sendMetric(name: string, average: number): MaybePromise<void>;
    abstract sendTrace(message: string): MaybePromise<void>;
    abstract sendErrorReport(error: Error): MaybePromise<void>;
    abstract flush(): MaybePromise<void>;
    abstract stop(): void;
}
