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

export default (doSelectDevice: (device: Device) => void) => {
    const globalAutoReconnect = useSelector(getGlobalAutoReconnect);
    const autoReconnectDevice = useSelector(getAutoReconnectDevice);
    const autoSelectDevice = useSelector<RootState, Device | undefined>(state =>
        autoReconnectDevice?.device.serialNumber != null
            ? getDevice(autoReconnectDevice?.device.serialNumber)(state)
            : undefined
    );

    useEffect(() => {
        if (!globalAutoReconnect) {
            return;
        }

        if (!autoReconnectDevice) {
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
