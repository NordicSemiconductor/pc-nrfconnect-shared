/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import Modal, { type ModalProps } from '../Modal/Modal';

interface ConfirmationModalProps extends ModalProps {
    title?: string;
    headerIcon?: string;
    confirmLabel?: string;
    onConfirmPrompt: () => void;
    cancelLabel?: string;
    onCancelPrompt?: () => void;
    optionalLabel?: string;
    onOptional?: () => void;
}

const ConfirmationModal: React.FC<
    React.PropsWithChildren<ConfirmationModalProps>
> = ({
    title = 'Confirm',
    headerIcon,
    id,
    confirmLabel = 'Confirm',
    onConfirmPrompt: onConfirm,
    cancelLabel = 'Cancel',
    onCancelPrompt: onCancel,
    optionalLabel,
    onOptional,
    children,
    ...attrs
}) => (
    <Modal id={id} {...attrs}>
        <Modal.Header>
            <Modal.Header.Title>{title}</Modal.Header.Title>
            {headerIcon && <span className={`mdi mdi-${headerIcon}`} />}
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

export default ConfirmationModal;
