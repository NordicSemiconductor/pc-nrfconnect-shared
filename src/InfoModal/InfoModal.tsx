/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { type ReactNode } from 'react';

import Modal, { type ModalProps } from '../Modal/Modal';

interface InfoDialogProps extends ModalProps {
    title?: string;
    footer?: ReactNode;
}

export const InfoDialog: React.FC<React.PropsWithChildren<InfoDialogProps>> = ({
    id,
    title = 'Info',
    footer,
    children,
    ...attrs
}) => (
    <Modal id={id} {...attrs}>
        <Modal.Header>
            <span className="mdi mdi-information" />
            <Modal.Header.Title>{title}</Modal.Header.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer className="tw-justify-end">
            {footer ?? (
                <Modal.CloseButton
                    variant="primary-outline"
                    size="lg"
                    modalId={id}
                >
                    Close
                </Modal.CloseButton>
            )}
        </Modal.Footer>
    </Modal>
);
