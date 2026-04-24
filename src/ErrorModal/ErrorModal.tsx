/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { type ReactNode } from 'react';

import Modal, { type ModalProps } from '../Modal/Modal';

interface ErrorDetailsProps {
    details: string;
}

export const ErrorDetails: React.FC<ErrorDetailsProps> = ({ details }) => (
    <details>
        <summary>Show technical details</summary>
        <pre className="error-details tw-m-1 tw-max-h-40 tw-overflow-y-auto tw-whitespace-pre-wrap">
            {details}
        </pre>
    </details>
);

interface ErrorDialogProps extends ModalProps {
    title?: string;
    footer?: ReactNode;
}

export const ErrorDialog: React.FC<
    React.PropsWithChildren<ErrorDialogProps>
> = ({ id, title = 'Error', footer, children, ...attrs }) => (
    <Modal id={id} {...attrs}>
        <Modal.Header>
            <span className="mdi mdi-alert" />
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
