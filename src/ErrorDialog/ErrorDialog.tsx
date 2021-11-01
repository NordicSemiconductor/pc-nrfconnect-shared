/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ReactMarkdown from 'react-markdown';
import { useDispatch, useSelector } from 'react-redux';

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

    const defaultErrorResolutions = { Close: () => dispatch(hideDialog()) };
    const errorResolutions =
        useSelector(errorResolutionsSelector) || defaultErrorResolutions;

    return (
        <Modal show={isVisible} onHide={() => dispatch(hideDialog())}>
            <Modal.Header closeButton>
                <Modal.Title>Error</Modal.Title>
            </Modal.Header>
            <Modal.Body className="core19-error-body">
                {messages.map(message => (
                    <ReactMarkdown
                        key={message}
                        source={message}
                        linkTarget="_blank"
                    />
                ))}
            </Modal.Body>
            <Modal.Footer>
                {Object.entries(errorResolutions).map(
                    ([label, handler], index) => (
                        <Button
                            key={label}
                            onClick={handler}
                            variant={
                                index === 0 ? 'primary' : 'outline-secondary'
                            }
                        >
                            {label}
                        </Button>
                    )
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default ErrorDialog;
