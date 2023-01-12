/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { ReactNode } from 'react';
import Modal from 'react-bootstrap/Modal';

import Button from '../Button/Button';
import Spinner from './Spinner';

import './dialog.scss';

export const Dialog = ({
    isVisible,
    closeOnUnfocus = false,
    onHide = () => {},
    className = '',
    children,
}: {
    isVisible: boolean;
    closeOnUnfocus?: boolean;
    onHide?: () => void;
    className?: string;
    children: ReactNode;
}) => (
    <Modal
        show={isVisible}
        backdrop={closeOnUnfocus ? true : 'static'}
        onHide={() => {
            if (closeOnUnfocus && onHide) {
                onHide();
            }
        }}
        centered
        className={`dialog ${className}`}
    >
        {children}
    </Modal>
);

Dialog.Header = ({
    title,
    headerIcon,
}: {
    title: string;
    headerIcon?: string;
}) => (
    <Modal.Header closeButton={false}>
        <p>
            <b>{title}</b>
        </p>
        {headerIcon && <span className={`mdi mdi-${headerIcon}`} />}
    </Modal.Header>
);

Dialog.Body = ({ children }: { children: ReactNode | string }) => (
    <Modal.Body>{children}</Modal.Body>
);

Dialog.Footer = ({
    showSpinner = false,
    children,
}: {
    showSpinner?: boolean;
    children: ReactNode;
}) => (
    <Modal.Footer>
        {showSpinner && <Spinner />}
        {children}
    </Modal.Footer>
);

export const DialogButton = ({
    variant = 'secondary',
    onClick,
    className,
    disabled = false,
    children,
}: {
    variant?: 'primary' | 'secondary';
    onClick: () => void;
    className?: string;
    disabled?: boolean;
    children: ReactNode | string;
}) => (
    <Button
        onClick={onClick}
        className={`${className} btn-${variant}`}
        disabled={disabled}
    >
        {children}
    </Button>
);

interface Props {
    isVisible: boolean;
    title?: string;
    headerIcon?: string;
    onClose: () => void;
    children: ReactNode | string;
}

export const InfoDialog = ({
    isVisible,
    title = 'Info',
    headerIcon,
    children,
    onClose,
}: Props) => (
    <Dialog isVisible={isVisible} closeOnUnfocus onHide={onClose}>
        <Dialog.Header title={title} headerIcon={headerIcon} />
        <Dialog.Body>{children}</Dialog.Body>
        <Dialog.Footer>
            <DialogButton onClick={onClose}>Close</DialogButton>
        </Dialog.Footer>
    </Dialog>
);

export const ErrorDialog = (props: Omit<Props, 'headerIcon'>) =>
    InfoDialog({
        ...props,
        title: props.title ?? 'Error',
        headerIcon: 'alert',
    });

interface ConfirmationDialogProps {
    isVisible: boolean;
    title?: string;
    headerIcon?: string;
    children: ReactNode | string;
    confirmLabel?: string;
    onConfirm: () => void;
    cancelLabel?: string;
    onCancel: () => void;
    optionalLabel?: string;
    onOptional?: () => void;
}

export const ConfirmationDialog = ({
    isVisible,
    title = 'Confirm',
    headerIcon,
    children,
    confirmLabel = 'Confirm',
    onConfirm,
    cancelLabel = 'Cancel',
    onCancel,
    optionalLabel,
    onOptional,
}: ConfirmationDialogProps) => (
    <Dialog isVisible={isVisible}>
        <Dialog.Header title={title} headerIcon={headerIcon} />
        <Dialog.Body>{children}</Dialog.Body>
        <Dialog.Footer>
            {onOptional && optionalLabel && (
                <DialogButton onClick={onOptional}>
                    {optionalLabel}
                </DialogButton>
            )}
            <DialogButton onClick={onConfirm}>{confirmLabel}</DialogButton>
            <DialogButton onClick={onCancel}>{cancelLabel}</DialogButton>
        </Dialog.Footer>
    </Dialog>
);
