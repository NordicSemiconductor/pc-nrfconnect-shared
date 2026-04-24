/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import Modal, { type ModalProps } from '../Modal/Modal';

interface ConfirmationDialogProps extends ModalProps {
    title?: string;
    headerIcon?: string;
    confirmLabel?: string;
    onConfirm: () => void;
    cancelLabel?: string;
    onCancel?: () => void;
    optionalLabel?: string;
    onOptional?: () => void;
}

export const ConfirmationDialog: React.FC<
    React.PropsWithChildren<ConfirmationDialogProps>
> = ({
    title = 'Confirm',
    id,
    confirmLabel = 'Confirm',
    onConfirm,
    cancelLabel = 'Cancel',
    onCancel,
    optionalLabel,
    onOptional,
    children,
    ...attrs
}) => (
    <Modal id={id} {...attrs}>
        <Modal.Header>
            <Modal.Header.Title>{title}</Modal.Header.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer className="tw-justify-end">
            <Modal.CloseButton
                variant="primary"
                size="lg"
                modalId={id}
                onClick={onConfirm}
            >
                {confirmLabel}
            </Modal.CloseButton>
            {onOptional && optionalLabel && (
                <Modal.CloseButton
                    variant="secondary"
                    size="lg"
                    modalId={id}
                    onClick={onOptional}
                >
                    {optionalLabel}
                </Modal.CloseButton>
            )}
            {onCancel && (
                <Modal.CloseButton
                    variant="secondary"
                    size="lg"
                    modalId={id}
                    onClick={onCancel}
                >
                    {cancelLabel}
                </Modal.CloseButton>
            )}
        </Modal.Footer>
    </Modal>
);
