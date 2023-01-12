/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useDispatch, useSelector } from 'react-redux';

import { Dialog, DialogButton } from '../Dialog/Dialog';
import {
    errorResolutions as errorResolutionsSelector,
    hideDialog,
    isVisible as isVisibleSelector,
    messages as messagesSelector,
} from './errorDialogSlice';

import './error.scss';

const ErrorDialog = () => {
    const dispatch = useDispatch();

    const isVisible = useSelector(isVisibleSelector);
    const messages = useSelector(messagesSelector);

    const defaultErrorResolutions = {
        Close: () => dispatch(hideDialog()),
    };
    const errorResolutions =
        useSelector(errorResolutionsSelector) || defaultErrorResolutions;

    return (
        <Dialog
            isVisible={isVisible}
            onHide={() => dispatch(hideDialog())}
            className="core19-error-body"
        >
            <Dialog.Header title="Error" headerIcon="alert" />
            <Dialog.Body>
                {messages.map(message => (
                    <ReactMarkdown
                        key={message}
                        source={message}
                        linkTarget="_blank"
                    />
                ))}
            </Dialog.Body>
            <Dialog.Footer>
                {Object.entries(errorResolutions).map(
                    ([label, handler], index) => (
                        <DialogButton
                            key={label}
                            onClick={handler}
                            variant={index === 0 ? 'primary' : 'secondary'}
                        >
                            {label}
                        </DialogButton>
                    )
                )}
            </Dialog.Footer>
        </Dialog>
    );
};

export default ErrorDialog;
