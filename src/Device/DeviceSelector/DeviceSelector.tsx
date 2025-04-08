/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { NrfutilDeviceLib } from '../../../nrfutil/device';
import { DeviceTraits } from '../../../nrfutil/device/common';
import logger from '../../logging';
import simplifyDevice from '../../telemetry/simplifyDevice';
import telemetry from '../../telemetry/telemetry';
import useHotKey from '../../utils/useHotKey';
import {
    clearWaitForDevice,
    getWaitingToAutoReselect,
    setAutoSelectDevice,
} from '../deviceAutoSelectSlice';
import {
    hasModem,
    startWatchingDevices,
    stopWatchingDevices,
} from '../deviceLister';
import { DeviceSetupConfig, setupDevice } from '../deviceSetup';
import DeviceSetupView from '../DeviceSetup/DeviceSetupView';
import {
    deselectDevice,
    deselectVirtualDevice,
    Device,
    deviceIsSelected as deviceIsSelectedSelector,
    isDeviceWithSerialNumber,
    selectDevice,
    selectedDevice,
    selectedVirtualDevice,
    selectVirtualDevice,
    setSelectedDeviceInfo,
} from '../deviceSlice';
import DeviceList from './DeviceList/DeviceList';
import SelectDevice from './SelectDevice';
import SelectedDevice from './SelectedDevice';
import SelectedVirtualDevice from './SelectedVirtualDevice';

export interface Props {
    deviceListing: DeviceTraits;
    deviceSetupConfig?: DeviceSetupConfig;
    onDeviceSelected?: (
        device: Device,
        autoReselected: boolean,
        abortController: AbortController
    ) => void;
    onDeviceDeselected?: () => void;
    onDeviceConnected?: (device: Device) => void;
    onDeviceDisconnected?: (device: Device) => void;
    onDeviceIsReady?: (device: Device) => void;
    deviceFilter?: (device: Device) => boolean;
    virtualDevices?: string[];
    onVirtualDeviceSelected?: (device: string) => void;
    onVirtualDeviceDeselected?: () => void;
}

const noop = () => {};
export default ({
    deviceListing,
    deviceSetupConfig,
    onDeviceSelected = noop,
    onDeviceDeselected = noop,
    onDeviceConnected = noop,
    onDeviceDisconnected = noop,
    onDeviceIsReady = noop,
    deviceFilter,
    virtualDevices = [],
    onVirtualDeviceSelected = noop,
    onVirtualDeviceDeselected = noop,
}: Props) => {
    const dispatch = useDispatch();
    const [deviceListVisible, setDeviceListVisible] = useState(false);

    const deviceIsSelected = useSelector(deviceIsSelectedSelector);
    const currentDevice = useSelector(selectedDevice);
    const waitingToAutoReconnect = useSelector(getWaitingToAutoReselect);
    const showSelectedDevice = deviceIsSelected || waitingToAutoReconnect;
    const virtualDeviceSelected = useSelector(selectedVirtualDevice);

    const abortController = useRef<AbortController>();

    const doDeselectDevice = useCallback(
        (device?: Device) => {
            abortController.current?.abort();
            if (device) {
                telemetry.sendEvent(
                    'device deselected ',
                    simplifyDevice(device)
                );
            }

            dispatch(clearWaitForDevice());
            dispatch(setAutoSelectDevice(undefined));
            logger.info(`Deselected device`);
            onDeviceDeselected();
            dispatch(deselectDevice());
        },
        [dispatch, onDeviceDeselected]
    );

    // Ensure that useCallback is
    // not updated frequently as this
    // will have a side effect to stop and start the hotplug events
    const doSelectDevice = useCallback(
        async (device: Device, autoReselected: boolean) => {
            logger.info(
                `Selecting device with the serial number ${device.serialNumber}`
            );
            abortController.current?.abort();
            const controller = new AbortController();
            abortController.current = controller;

            dispatch(clearWaitForDevice());
            setDeviceListVisible(false);
            dispatch(selectDevice(device));
            dispatch(setAutoSelectDevice(device));

            const deviceInfo = await NrfutilDeviceLib.deviceInfo(
                device,
                undefined,
                undefined,
                controller
            );

            // Modem might be set to false when using external jLink or custom PCBs
            if (!device.traits.modem && hasModem(device, deviceInfo)) {
                const newDevice = {
                    ...device,
                    traits: { ...device.traits, modem: true },
                };
                dispatch(selectDevice(newDevice));
                dispatch(setAutoSelectDevice(newDevice));
            }

            if (!controller.signal.aborted) {
                dispatch(setSelectedDeviceInfo(deviceInfo));
                logger.info(
                    `Selected device with the serial number ${device.serialNumber}`
                );
                onDeviceSelected(device, autoReselected, controller);

                telemetry.sendEvent('device selected', {
                    device: simplifyDevice(device),
                    deviceInfo,
                });

                if (deviceSetupConfig) {
                    if (isDeviceWithSerialNumber(device)) {
                        dispatch(
                            setupDevice(
                                device,
                                deviceSetupConfig,
                                onDeviceIsReady,
                                doDeselectDevice,
                                deviceInfo
                            )
                        );
                    } else {
                        logger.warn(
                            `Selected device has no serial number. Device setup is not supported.`
                        );
                        onDeviceIsReady(device);
                    }
                }
            }
        },
        [
            deviceSetupConfig,
            dispatch,
            doDeselectDevice,
            onDeviceIsReady,
            onDeviceSelected,
        ]
    );

    const doStartWatchingDevices = useCallback(() => {
        dispatch(
            startWatchingDevices(
                deviceListing,
                onDeviceConnected,
                device => {
                    logger.info(
                        `Device connected with the serial number ${device.serialNumber}`
                    );
                    onDeviceDisconnected(device);
                },
                onDeviceDeselected,
                doSelectDevice
            )
        );
    }, [
        deviceListing,
        dispatch,
        onDeviceConnected,
        onDeviceDisconnected,
        onDeviceDeselected,
        doSelectDevice,
    ]);

    const toggleDeviceListVisible = () =>
        setDeviceListVisible(!deviceListVisible);

    useEffect(() => {
        doStartWatchingDevices();
        return stopWatchingDevices;
    }, [doStartWatchingDevices]);

    useHotKey({
        hotKey: 'alt+s',
        title: 'Select device',
        isGlobal: true,
        action: () => toggleDeviceListVisible(),
    });

    return (
        <div className="core19-device-selector">
            {!showSelectedDevice && !virtualDeviceSelected && (
                <SelectDevice
                    deviceListVisible={deviceListVisible}
                    toggleDeviceListVisible={toggleDeviceListVisible}
                />
            )}
            {showSelectedDevice && (
                <SelectedDevice
                    doDeselectDevice={() => doDeselectDevice(currentDevice)}
                    toggleDeviceListVisible={toggleDeviceListVisible}
                />
            )}
            {virtualDeviceSelected && (
                <SelectedVirtualDevice
                    virtualDevice={virtualDeviceSelected}
                    deselectVirtualDevice={() => {
                        onVirtualDeviceDeselected();
                        dispatch(deselectVirtualDevice());
                    }}
                    toggleDeviceListVisible={toggleDeviceListVisible}
                />
            )}
            <DeviceList
                isVisible={deviceListVisible}
                doSelectDevice={(device, autoReselected) => {
                    if (device.id === currentDevice?.id) {
                        setDeviceListVisible(false);
                        return;
                    }

                    if (deviceIsSelected) {
                        doDeselectDevice(currentDevice);
                    }

                    if (virtualDeviceSelected) {
                        dispatch(deselectVirtualDevice());
                        onVirtualDeviceDeselected();
                    }

                    doSelectDevice(device, autoReselected);
                }}
                virtualDevices={virtualDevices}
                doSelectVirtualDevice={device => {
                    if (virtualDeviceSelected === device) {
                        setDeviceListVisible(false);
                        return;
                    }

                    if (deviceIsSelected) {
                        doDeselectDevice(currentDevice);
                    }

                    if (virtualDeviceSelected) {
                        dispatch(deselectVirtualDevice());
                        onVirtualDeviceSelected(device);
                    }

                    dispatch(clearWaitForDevice());
                    setDeviceListVisible(false);
                    abortController.current?.abort();

                    dispatch(selectVirtualDevice(device));
                    onVirtualDeviceSelected(device);
                }}
                deviceFilter={deviceFilter}
            />
            <DeviceSetupView />
        </div>
    );
};
