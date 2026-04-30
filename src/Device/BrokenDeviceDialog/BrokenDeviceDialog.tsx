/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ErrorDialog } from '../../Dialog/Dialog';
import {
    brokenDeviceSelector,
    hideDialog,
    isVisible as isVisibleSelector,
} from './brokenDeviceDialogSlice';

import './broken-device-dialog.scss';

const BrokenDeviceDialog = () => {
    const dispatch = useDispatch();

    const isVisible = useSelector(isVisibleSelector);
    const { description, url } = useSelector(brokenDeviceSelector);

    return (
        <ErrorDialog
            isVisible={isVisible}
            onHide={() => dispatch(hideDialog())}
            title="Unusable device"
        >
            <p>{description}</p>
            <a target="_blank" rel="noreferrer" href={url}>
                {url}
            </a>
        </ErrorDialog>
    );
};

export default BrokenDeviceDialog;
