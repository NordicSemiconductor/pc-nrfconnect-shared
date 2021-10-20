/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { getDevice } from '../deviceSlice';

export default doSelectDevice => {
    const alreadyTriedToAutoselect = useRef(false);

    const autoselectDevice = useSelector(
        getDevice(process.env.AUTOSELECT_DEVICE)
    );

    useEffect(() => {
        if (alreadyTriedToAutoselect.current || autoselectDevice == null) {
            return;
        }

        alreadyTriedToAutoselect.current = true;
        doSelectDevice(autoselectDevice);
    }, [autoselectDevice, doSelectDevice]);
};
