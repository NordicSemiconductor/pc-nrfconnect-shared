/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { PDFObject } from 'react-pdfobject';

const LicenseCard = () => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Button className="button" onClick={handleShow}>
                Show license
            </Button>

            <Modal
                className="pdfobject-modal"
                size="lg"
                show={show}
                onHide={handleClose}
            >
                <Modal.Header closeButton>
                    <Modal.Title>License</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* PDFObject height is being overwritten somewhere */}
                    {/* This is just an example pdf, License filename goes here */}
                    <PDFObject url="license.pdf" />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default LicenseCard;
