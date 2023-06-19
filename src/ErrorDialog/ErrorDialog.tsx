/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { Fragment } from 'react';
import ReactMarkdown from 'react-markdown';
import { useDispatch, useSelector } from 'react-redux';

import { Dialog, DialogButton } from '../Dialog/Dialog';
import {
    ErrorMessage,
    errorResolutions as errorResolutionsSelector,
    hideDialog,
    isVisible as isVisibleSelector,
    messages as messagesSelector,
} from './errorDialogSlice';

import './error.scss';

const ErrorMessage = ({
    error: { message, detail },
}: {
    error: ErrorMessage;
}) => (
    <>
        <ReactMarkdown source={message} linkTarget="_blank" />
        {detail != null && (
            <details className="details">
                <summary>Show technical details</summary>
                <pre>{detail}</pre>
            </details>
        )}
    </>
);

const MultipleErrorMessages = ({ messages }: { messages: ErrorMessage[] }) => (
    <>
        There are multiple errors:
        <ul>
            {messages.map(message => (
                <li key={message.message}>
                    <ErrorMessage error={message} />
                </li>
            ))}
        </ul>
    </>
);

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
                {messages.length === 1 ? (
                    <ErrorMessage error={messages[0]} />
                ) : (
                    <MultipleErrorMessages messages={messages} />
                )}
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
