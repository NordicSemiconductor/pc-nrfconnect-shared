/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { DeviceTraits } from '@nordicsemiconductor/nrf-device-lib-js';

import logger from '../../logging';
import { Device, RootState } from '../../state';
import {
    getAutoReconnectDevice,
    getDevice,
    getGlobalAutoReconnect,
    selectedDevice,
} from '../deviceSlice';

export const DEFAULT_DEVICE_WAIT_TIME_MS = 3000;

const hasSameDeviceTraits = (
    deviceTraits: DeviceTraits,
    otherDeviceTraits: DeviceTraits
) =>
    Object.keys(otherDeviceTraits).every(
        rule =>
            deviceTraits[rule as keyof DeviceTraits] ===
            otherDeviceTraits[rule as keyof DeviceTraits]
    );

export default (
    doSelectDevice: (device: Device, autoReconnected: boolean) => void
) => {
    const timeoutWarning = useRef<NodeJS.Timeout | null>(null);

    const globalAutoReconnect = useSelector(getGlobalAutoReconnect);
    const autoReconnectDevice = useSelector(getAutoReconnectDevice);
    const autoSelectDevice = useSelector<RootState, Device | undefined>(state =>
        autoReconnectDevice?.device.serialNumber != null
            ? getDevice(autoReconnectDevice?.device.serialNumber)(state)
            : undefined
    );
    const currentSelectedDevice = useSelector(selectedDevice);

    const initTimeoutWarning = useCallback(
        (timeoutMs: number) => {
            timeoutWarning.current = setTimeout(() => {
                if (autoReconnectDevice?.forceReconnect?.onFail)
                    autoReconnectDevice?.forceReconnect?.onFail();
                logger.error(
                    `Auto Reconnect failed. Device did not show up after ${
                        timeoutMs / 1000
                    } seconds`
                );
            }, timeoutMs);
        },
        [autoReconnectDevice]
    );

    useEffect(() => {
        // if we disconnect from a device with a dfuTriggerVersion init warning timeout
        if (
            autoReconnectDevice?.disconnectionTime !== undefined &&
            autoReconnectDevice.forceReconnect !== undefined
        ) {
            initTimeoutWarning(autoReconnectDevice.forceReconnect.timeoutMS);
        }
    }, [autoReconnectDevice, initTimeoutWarning]);

    useEffect(() => {
        if (currentSelectedDevice) {
            if (timeoutWarning.current) {
                clearTimeout(timeoutWarning.current);
            }
        }
    }, [currentSelectedDevice]);

    const shouldAutoReconnect = useCallback(() => {
        // No device was selected when disconnection occurred
        if (!autoReconnectDevice) return null;

        // device is still connected
        if (autoReconnectDevice.disconnectionTime === undefined) return null;

        // The device that was selected when disconnection occurred is not yet connected
        if (!autoSelectDevice) {
            return null;
        }

        // The device is already selected
        if (
            autoSelectDevice.serialNumber ===
            autoReconnectDevice.device.serialNumber
        ) {
            return null;
        }

        // Device is to be reconnected as timeout is provided
        if (
            autoReconnectDevice.forceReconnect &&
            autoReconnectDevice.disconnectionTime +
                autoReconnectDevice.forceReconnect.timeoutMS <
                Date.now()
        ) {
            logger.info(`Force Auto Reconnecting`);
            return autoSelectDevice;
        }

        // Device is in boot loader reconnected before DEFAULT_DEVICE_WAIT_TIME_MS
        if (
            autoSelectDevice.usb?.device.descriptor.idProduct !== 0x521f &&
            autoSelectDevice.usb?.device.descriptor.idVendor !== 0x1915 &&
            autoReconnectDevice.disconnectionTime +
                DEFAULT_DEVICE_WAIT_TIME_MS <
                Date.now()
        ) {
            logger.info(`Auto Reconnecting due to boot loader mode`);
            return autoSelectDevice;
        }

        // Device does not have the same traits
        if (
            !hasSameDeviceTraits(
                autoSelectDevice.traits,
                autoReconnectDevice.device.traits
            )
        ) {
            return null;
        }

        return globalAutoReconnect ? autoSelectDevice : null;
    }, [autoReconnectDevice, autoSelectDevice, globalAutoReconnect]);

    useEffect(() => {
        const device = shouldAutoReconnect();
        if (device) {
            logger.info(`Auto Reconnecting Device SN: ${device.serialNumber}`);
            doSelectDevice(device, true);
            if (autoReconnectDevice?.forceReconnect?.onSuccess)
                autoReconnectDevice?.forceReconnect?.onSuccess(device);
        }
    }, [
        autoReconnectDevice,
        autoSelectDevice,
        doSelectDevice,
        shouldAutoReconnect,
    ]);
};
