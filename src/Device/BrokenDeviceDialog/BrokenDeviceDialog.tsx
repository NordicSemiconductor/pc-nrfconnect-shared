/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useDispatch, useSelector } from 'react-redux';

import {
    hideDialog,
    info as infoSelector,
    isVisible as isVisibleSelector,
} from './brokenDeviceDialogSlice';

import './broken-device-dialog.scss';

const BrokenDeviceDialog = () => {
    const dispatch = useDispatch();

    const isVisible = useSelector(isVisibleSelector);
    const { description, url } = useSelector(infoSelector);

    return (
        <Modal
            show={isVisible}
            onHide={() => dispatch(hideDialog())}
            centered
            className="broken-device-dialog"
        >
            <Modal.Header closeButton={false}>
                <p>
                    <b>Unusable device</b>
                </p>

                <span className="mdi mdi-alert" />
            </Modal.Header>
            <Modal.Body>
                <p>{description}</p>
                <a target="_blank" rel="noreferrer" href={url}>
                    {url}
                </a>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    onClick={() => dispatch(hideDialog())}
                    variant="secondary"
                >
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default BrokenDeviceDialog;
