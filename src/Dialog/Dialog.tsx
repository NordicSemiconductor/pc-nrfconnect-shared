/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { ReactNode } from 'react';
import { Spinner } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';

import Button, { ButtonVariants } from '../Button/Button';

import './dialog.scss';

type CoreProps = {
    isVisible: boolean;
    onHide?: () => void;
    className?: string;
    size?: 'sm' | 'm' | 'lg' | 'xl';
    children: ReactNode | string;
};

type DialogProps = CoreProps & {
    closeOnUnfocus?: boolean;
    closeOnEsc?: boolean;
};

export const Dialog = ({
    isVisible,
    closeOnUnfocus = false,
    closeOnEsc = false,
    onHide = () => {},
    className = '',
    size = 'm',
    children,
}: DialogProps) => (
    <Modal
        onEscapeKeyDown={() => {
            if (closeOnEsc && onHide) {
                onHide();
            }
        }}
        show={isVisible}
        size={size === 'm' ? undefined : size}
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
    showSpinner,
}: {
    title: string;
    headerIcon?: string;
    showSpinner?: boolean;
}) => (
    <Modal.Header closeButton={false}>
        <p>
            <b>{title}</b>
            {showSpinner && <Spinner size="sm" animation="border" />}
        </p>
        {headerIcon && <span className={`mdi mdi-${headerIcon}`} />}
    </Modal.Header>
);

Dialog.Body = ({ children }: { children: ReactNode | string }) => (
    <Modal.Body>{children}</Modal.Body>
);

Dialog.Footer = ({ children }: { children: ReactNode }) => (
    <Modal.Footer>{children}</Modal.Footer>
);

export interface DialogButtonProps {
    onClick: () => void;
    variant?: ButtonVariants;
    className?: string;
    disabled?: boolean;
    children: ReactNode | string;
}

export const DialogButton = ({
    variant = 'secondary',
    onClick,
    className = '',
    disabled = false,
    children,
}: DialogButtonProps) => (
    <Button
        large
        variant={variant}
        onClick={onClick}
        className={className}
        disabled={disabled}
    >
        {children}
    </Button>
);

interface GenericDialogProps extends CoreProps {
    title: string;
    footer: React.ReactNode;
    headerIcon?: string;
    showSpinner?: boolean;
    closeOnUnfocus?: boolean;
    closeOnEsc?: boolean;
}

export const GenericDialog = ({
    isVisible,
    onHide,
    title,
    headerIcon,
    children,
    className,
    footer,
    showSpinner = false,
    closeOnUnfocus,
    closeOnEsc,
    size,
}: GenericDialogProps) => (
    <Dialog
        onHide={onHide}
        closeOnUnfocus={closeOnUnfocus}
        closeOnEsc={closeOnEsc}
        isVisible={isVisible}
        className={className}
        size={size}
    >
        <Dialog.Header
            title={title}
            headerIcon={headerIcon}
            showSpinner={showSpinner}
        />
        <Dialog.Body>{children}</Dialog.Body>
        <Dialog.Footer>{footer}</Dialog.Footer>
    </Dialog>
);

interface InfoProps extends Omit<CoreProps, 'onHide'> {
    title?: string;
    headerIcon?: string;
    onClose: () => void;
}

export const InfoDialog = ({
    isVisible,
    title = 'Info',
    headerIcon = 'info',
    children,
    onClose,
    size,
    className,
}: InfoProps) => (
    <GenericDialog
        closeOnEsc
        onHide={onClose}
        isVisible={isVisible}
        headerIcon={headerIcon}
        title={title}
        className={className}
        size={size}
        footer={<DialogButton onClick={onClose}>Close</DialogButton>}
    >
        {children}
    </GenericDialog>
);

export const ErrorDialog = (props: Omit<InfoProps, 'headerIcon'>) =>
    InfoDialog({
        ...props,
        title: props.title ?? 'Error',
        headerIcon: 'alert',
    });

interface ConfirmationDialogProps extends Omit<CoreProps, 'onHide'> {
    title?: string;
    headerIcon?: string;
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
    className,
    confirmLabel = 'Confirm',
    onConfirm,
    cancelLabel = 'Cancel',
    onCancel,
    optionalLabel,
    onOptional = () => {},
    size,
}: ConfirmationDialogProps) => (
    <GenericDialog
        onHide={onCancel}
        closeOnEsc
        isVisible={isVisible}
        headerIcon={headerIcon}
        title={title}
        className={className}
        size={size}
        footer={
            <>
                <DialogButton variant="primary" onClick={onConfirm}>
                    {confirmLabel}
                </DialogButton>
                <DialogButton onClick={onCancel}>{cancelLabel}</DialogButton>
                {optionalLabel && (
                    <DialogButton onClick={onOptional}>
                        {optionalLabel}
                    </DialogButton>
                )}
            </>
        }
    >
        {children}
    </GenericDialog>
);
