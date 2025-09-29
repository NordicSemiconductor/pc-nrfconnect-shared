/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';

import PseudoButton from '../../../PseudoButton/PseudoButton';
import classNames from '../../../utils/classNames';
import chevron from '../arrow-down.svg';

import './broken-device.scss';
import '../selected-device.scss';

export const VirtualDeviceEntry = ({
    virtualDevice,
    onSelect,
}: {
    virtualDevice: string;
    onSelect: () => void;
}) => (
    <PseudoButton
        className="tw-flex tw-flex-col tw-gap-2 tw-border-x-0 tw-border-b tw-border-t-0 tw-border-solid tw-border-b-gray-200 tw-bg-gray-700 tw-py-3 tw-font-light hover:tw-bg-gray-600"
        onClick={onSelect}
    >
        <div className="basic-device-info tw-h-[42px] tw-cursor-pointer tw-text-gray-50">
            <span className="icon mdi mdi-flask-empty tw-text-2xl" />
            <div className="details tw-flex tw-flex-col">
                <p className="tw-m-0 tw-text-sm tw-font-bold">
                    {virtualDevice}
                </p>
                <p className="tw-m-0 tw-text-xs tw-uppercase">Virtual Device</p>
            </div>
        </div>
    </PseudoButton>
);

export default ({
    virtualDevices,
    visibleAndNoDevicesConnected,
    doSelectVirtualDevice,
}: {
    virtualDevices: string[];
    visibleAndNoDevicesConnected: boolean;
    doSelectVirtualDevice: (virtualDevice: string) => void;
}) => {
    const [deviceListVisible, setDeviceListVisible] = useState(false);

    useEffect(() => {
        if (visibleAndNoDevicesConnected) {
            setDeviceListVisible(true);
        }
    }, [visibleAndNoDevicesConnected]);

    return (
        <div>
            <div
                className={classNames(
                    'device-list tw-transform tw-duration-200 tw-ease-in-out',
                    !deviceListVisible && 'tw-h-0 tw-translate-y-full',
                )}
            >
                {virtualDevices.map(virtualDevice => (
                    <VirtualDeviceEntry
                        key={virtualDevice}
                        virtualDevice={virtualDevice}
                        onSelect={() => {
                            setDeviceListVisible(false);
                            doSelectVirtualDevice(virtualDevice);
                        }}
                    />
                ))}
            </div>
            <PseudoButton
                className="tw-relative tw-z-10 tw-flex tw-h-10 tw-flex-row tw-items-center tw-justify-end tw-bg-gray-700 tw-p-3 tw-text-base tw-text-gray-50"
                onClick={() => setDeviceListVisible(!deviceListVisible)}
            >
                <div className="tw-flex-grow-[.5] tw-uppercase">
                    Virtual Devices
                </div>
                <img
                    className={classNames(
                        'tw-transform tw-duration-100 tw-ease-linear',
                        !deviceListVisible && 'tw-rotate-180',
                    )}
                    src={chevron}
                    alt=""
                />
            </PseudoButton>
        </div>
    );
};
