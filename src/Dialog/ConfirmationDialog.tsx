/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, ReactNode } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { arrayOf, bool, func, node, oneOfType, string } from 'prop-types';

import Spinner from './Spinner';

export interface Props {
    isVisible: boolean;
    title?: string;
    text?: string;
    children?: ReactNode;
    onOk: () => void;
    onCancel: () => void;
    okButtonClassName?: string;
    okButtonText?: string;
    cancelButtonText?: string;
    isInProgress?: boolean;
    isOkButtonEnabled?: boolean;
}

/**
 * Generic dialog that asks the user to confirm something. The dialog content
 * and button actions can be customized.
 *
 * @param {boolean} isVisible Show the dialog or not.
 * @param {boolean} [isInProgress] Shows a spinner if true. Default: false.
 * @param {string} [title] The dialog title. Default: "Confirm".
 * @param {Array|*} [children] Array or React element to render in the dialog.
 * @param {string} [text] Text to render in the dialog. Alternative to `children`.
 * @param {function} onOk Invoked when the user clicks OK.
 * @param {function} [onCancel] Invoked when the user cancels. Not showing cancel button if
 *                              this is not provided.
 * @param {string} [okButtonClassName] Class name for the OK button. Default: "".
 * @param {string} [okButtonText] Label text for the OK button. Default: "OK".
 * @param {string} [cancelButtonText] Label text for the cancel button. Default: "Cancel".
 * @param {boolean} [isOkButtonEnabled] Enable the OK button or not. Default: true.
 * @returns {*} React element to be rendered.
 */
const ConfirmationDialog: FC<Props> = ({
    isVisible,
    isInProgress = false,
    title = 'Confirm',
    children,
    text,
    onOk,
    onCancel,
    okButtonClassName = '',
    okButtonText = 'OK',
    cancelButtonText = 'Cancel',
    isOkButtonEnabled = true,
}) => (
    <Modal
        show={isVisible}
        onHide={onCancel}
        backdrop={isInProgress ? 'static' : true}
        size="lg"
    >
        <Modal.Header closeButton={!isInProgress}>
            <Modal.Title data-testid="title">
                <h3>{title}</h3>
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>{children || <p data-testid="body">{text}</p>}</Modal.Body>
        <Modal.Footer>
            {isInProgress ? <Spinner /> : null}
            &nbsp;
            <Button
                className={okButtonClassName}
                variant="primary"
                onClick={onOk}
                disabled={!isOkButtonEnabled || isInProgress}
            >
                {okButtonText}
            </Button>
            <Button
                onClick={onCancel}
                disabled={isInProgress}
                variant="outline-primary"
            >
                {cancelButtonText}
            </Button>
        </Modal.Footer>
    </Modal>
);

ConfirmationDialog.propTypes = {
    isVisible: bool.isRequired,
    title: string,
    text: string,
    children: oneOfType([arrayOf(node), node]),
    onOk: func.isRequired,
    onCancel: func.isRequired,
    okButtonClassName: string,
    okButtonText: string,
    cancelButtonText: string,
    isInProgress: bool,
    isOkButtonEnabled: bool,
};

export default ConfirmationDialog;
