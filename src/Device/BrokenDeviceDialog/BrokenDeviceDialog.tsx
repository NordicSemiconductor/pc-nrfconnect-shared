/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useId } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ErrorModalBase } from '../../ErrorModal/ErrorModal';
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

    const id = `${useId()}-modal`;

    return (
        <ErrorModalBase
            id={id}
            closingBehavior="request"
            overrideModalState={isVisible ? 'open' : 'force-close'}
            onClose={() => dispatch(hideDialog())}
            title="Unusable device"
        >
            <p>{description}</p>
            <a target="_blank" rel="noreferrer" href={url}>
                {url}
            </a>
        </ErrorModalBase>
    );
};

export default BrokenDeviceDialog;
