/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useDispatch, useSelector } from 'react-redux';

import {
    DialogButton,
    ErrorDetails,
    ErrorDialog as BaseErrorDialog,
} from '../Dialog/Dialog';
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
        <ReactMarkdown linkTarget="_blank">{message}</ReactMarkdown>
        {detail != null && <ErrorDetails detail={detail} />}
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
    const errorResolutions = useSelector(errorResolutionsSelector);

    return (
        <BaseErrorDialog
            isVisible={isVisible}
            onHide={() => dispatch(hideDialog())}
            footer={
                errorResolutions &&
                Object.entries(errorResolutions).map(
                    ([label, handler], index) => (
                        <DialogButton
                            key={label}
                            onClick={handler}
                            variant={
                                index !== 0 ||
                                Object.keys(errorResolutions).length === 1
                                    ? 'secondary'
                                    : 'primary'
                            }
                        >
                            {label}
                        </DialogButton>
                    ),
                )
            }
        >
            {messages.length === 1 ? (
                <ErrorMessage error={messages[0]} />
            ) : (
                <MultipleErrorMessages messages={messages} />
            )}
        </BaseErrorDialog>
    );
};

export default ErrorDialog;
