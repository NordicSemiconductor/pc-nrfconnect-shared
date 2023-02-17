/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { DeviceTraits } from '@nordicsemiconductor/nrf-device-lib-js';

import logger from '../../logging';
import { Device, RootState, TDispatch } from '../../state';
import {
    clearAutoReconnect,
    closeSetupDialogVisible,
    getAutoReconnectDevice,
    getDevice,
    getDevices,
    getGlobalAutoReconnect,
    selectedDevice,
} from '../deviceSlice';
import { isDeviceInDFUBootloader } from '../sdfuOperations';

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
    doSelectDevice: (
        device: Device,
        autoReconnected: boolean,
        forcedAutoReconnected: boolean
    ) => void,
    dispatch: TDispatch
) => {
    const timeoutWarning = useRef<NodeJS.Timeout | null>(null);
    const [deviceListChanged, setDeviceListChanged] = useState(false);

    const deviceList = useSelector(getDevices);
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
                dispatch(clearAutoReconnect());
                dispatch(closeSetupDialogVisible());
                if (autoReconnectDevice?.forceReconnect?.onFail)
                    autoReconnectDevice?.forceReconnect?.onFail();
                logger.warn(
                    `Auto Reconnect failed. Device did not show up after ${
                        timeoutMs / 1000
                    } seconds`
                );
            }, timeoutMs);
        },
        [autoReconnectDevice, dispatch]
    );

    useEffect(() => {
        // if we disconnect from a device with a dfuTriggerVersion init warning timeout
        if (
            autoReconnectDevice?.disconnectionTime !== undefined &&
            autoReconnectDevice.forceReconnect !== undefined
        ) {
            initTimeoutWarning(autoReconnectDevice.forceReconnect.timeout);
        }
    }, [autoReconnectDevice, initTimeoutWarning]);

    useEffect(() => {
        if (currentSelectedDevice) {
            if (timeoutWarning.current) {
                clearTimeout(timeoutWarning.current);
            }
        }
    }, [currentSelectedDevice]);

    useEffect(() => {
        setDeviceListChanged(true);
    }, [dispatch, deviceList]);

    const shouldAutoReconnect = useCallback((): {
        device: Device;
        forcedAutoReconnected: boolean;
    } | null => {
        // device list did not change
        if (!deviceListChanged) return null;

        // No device was selected when disconnection occurred
        if (!autoReconnectDevice) return null;

        // device is still connected
        if (autoReconnectDevice.disconnectionTime === undefined) return null;

        setDeviceListChanged(false);

        // The device that was selected when disconnection occurred is not yet connected
        if (!autoSelectDevice) {
            return null;
        }

        // The device is already selected
        if (
            currentSelectedDevice?.serialNumber ===
            autoReconnectDevice.device.serialNumber
        ) {
            return null;
        }

        // Device is to be reconnected as timeout is provided
        if (
            autoReconnectDevice.forceReconnect &&
            autoReconnectDevice.disconnectionTime +
                autoReconnectDevice.forceReconnect.timeout >=
                Date.now()
        ) {
            if (autoReconnectDevice.forceReconnect.when === 'always') {
                logger.info(`Force Auto Reconnecting`);
                return {
                    device: autoSelectDevice,
                    forcedAutoReconnected: true,
                };
            }

            if (
                autoReconnectDevice.forceReconnect.when === 'BootLoaderMode' &&
                isDeviceInDFUBootloader(autoSelectDevice)
            ) {
                logger.info(`Force Auto Reconnecting in Boot Loader Mode`);
                return {
                    device: autoSelectDevice,
                    forcedAutoReconnected: true,
                };
            }

            if (
                autoReconnectDevice.forceReconnect.when === 'applicationMode' &&
                autoSelectDevice.dfuTriggerInfo !== null
            ) {
                logger.info(`Force Auto Reconnecting in Application Mode`);
                return {
                    device: autoSelectDevice,
                    forcedAutoReconnected: true,
                };
            }
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

        return globalAutoReconnect
            ? {
                  device: autoSelectDevice,
                  forcedAutoReconnected: false,
              }
            : null;
    }, [
        autoReconnectDevice,
        autoSelectDevice,
        currentSelectedDevice?.serialNumber,
        deviceListChanged,
        globalAutoReconnect,
    ]);

    useEffect(() => {
        const result = shouldAutoReconnect();
        if (result?.device) {
            logger.info(
                `Auto Reconnecting Device SN: ${result.device.serialNumber}`
            );
            doSelectDevice(result.device, true, result.forcedAutoReconnected);
            if (autoReconnectDevice?.forceReconnect?.onSuccess)
                autoReconnectDevice?.forceReconnect?.onSuccess(result.device);
        }
    }, [
        autoReconnectDevice,
        autoSelectDevice,
        doSelectDevice,
        shouldAutoReconnect,
    ]);
};
