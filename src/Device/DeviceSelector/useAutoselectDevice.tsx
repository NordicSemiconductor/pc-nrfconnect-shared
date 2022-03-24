/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { Device, RootState } from '../../state';
import { getDevice } from '../deviceSlice';

export default (doSelectDevice: (device: Device) => void) => {
    const alreadyTriedToAutoselect = useRef(false);

    const { argv } = process;
    const serialIndex = argv.findIndex(arg => arg === '--deviceSerial');
    const serialNumber = serialIndex > -1 ? argv[serialIndex + 1] : undefined;

    const autoselectDevice = useSelector<RootState, Device | undefined>(state =>
        serialNumber != null ? getDevice(serialNumber)(state) : undefined
    );

    useEffect(() => {
        if (alreadyTriedToAutoselect.current || autoselectDevice == null) {
            return;
        }

        alreadyTriedToAutoselect.current = true;
        doSelectDevice(autoselectDevice);
    }, [autoselectDevice, doSelectDevice]);
};
