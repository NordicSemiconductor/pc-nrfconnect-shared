/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import logger from '../../logging';
import { Device, RootState } from '../../state';
import {
    getAutoReconnectDevice,
    getDevice,
    getGlobalAutoReconnect,
} from '../deviceSlice';

const DEFAULT_DEVICE_WAIT_TIME = 3000;

export default (doSelectDevice: (device: Device) => void) => {
    const globalAutoReconnect = useSelector(getGlobalAutoReconnect);
    const autoReconnectDevice = useSelector(getAutoReconnectDevice);
    const autoSelectDevice = useSelector<RootState, Device | undefined>(state =>
        autoReconnectDevice?.device.serialNumber != null
            ? getDevice(autoReconnectDevice?.device.serialNumber)(state)
            : undefined
    );

    // Support Switch Mode
    useEffect(() => {
        if (!autoReconnectDevice) {
            return;
        }

        const hasDfuTriggerVersion =
            autoReconnectDevice.device.dfuTriggerVersion != null;

        const t = setTimeout(() => {
            if (hasDfuTriggerVersion) {
                logger.debug(
                    `Device did not show up after ${
                        DEFAULT_DEVICE_WAIT_TIME / 1000
                    } seconds`
                );
            }
        }, DEFAULT_DEVICE_WAIT_TIME);

        return () => {
            clearTimeout(t);
        };
    }, [autoReconnectDevice]);

    useEffect(() => {
        if (!autoReconnectDevice) {
            return;
        }

        // Support Switch Mode
        const hasDfuTriggerVersion =
            autoReconnectDevice.device.dfuTriggerVersion != null;

        if (!globalAutoReconnect && !hasDfuTriggerVersion) {
            return;
        }

        if (!autoReconnectDevice.disconnectionTime) {
            return;
        }

        if (autoSelectDevice) {
            logger.info(
                `Auto Reconnecting Device SN: ${autoSelectDevice.serialNumber}`
            );
            doSelectDevice(autoSelectDevice);
        }
    }, [
        doSelectDevice,
        autoReconnectDevice,
        autoSelectDevice,
        globalAutoReconnect,
    ]);
};
