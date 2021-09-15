/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { remote } from 'electron';

import ConfirmationDialog from '../Dialog/ConfirmationDialog';
import { hideDialog } from './appReloadDialogActions';
import {
    isVisible as isVisibleSelector,
    message as messageSelector,
} from './appReloadDialogReducer';

const reloadApp = () => setImmediate(() => remote.getCurrentWindow().reload());

const AppReloadDialog = () => {
    const dispatch = useDispatch();

    const isVisible = useSelector(isVisibleSelector);
    const message = useSelector(messageSelector);

    return (
        <ConfirmationDialog
            isVisible={isVisible}
            onOk={reloadApp}
            onCancel={() => dispatch(hideDialog())}
            okButtonText="Yes"
            cancelButtonText="No"
            text={message}
        />
    );
};

export default AppReloadDialog;
