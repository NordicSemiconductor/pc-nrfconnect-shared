/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { ReactNode } from 'react';
import Modal from 'react-bootstrap/Modal';

import Button, { ButtonVariants } from '../Button/Button';
import Spinner from '../Spinner/Spinner';

import './dialog.scss';

type CoreProps = {
    isVisible: boolean;
    onHide?: () => void;
    className?: string;
    size?: 'sm' | 'm' | 'lg' | 'xl';
    children: ReactNode;
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
        <div className="tw-flex tw-flex-row">
            <b>{title}</b>
            {showSpinner && (
                <div className="tw-pl-4">
                    <Spinner size="sm" />
                </div>
            )}
        </div>
        {headerIcon && <span className={`mdi mdi-${headerIcon}`} />}
    </Modal.Header>
);

Dialog.Body = ({ children }: { children: ReactNode }) => (
    <Modal.Body className="tw-select-text">{children}</Modal.Body>
);

Dialog.Footer = ({ children }: { children: ReactNode }) => (
    <Modal.Footer className="tw-preflight tw-flex tw-flex-row-reverse tw-justify-start tw-gap-2 tw-border-none tw-p-4">
        {children}
    </Modal.Footer>
);

export interface DialogButtonProps {
    onClick: () => void;
    variant?: ButtonVariants;
    className?: string;
    disabled?: boolean;
    children: ReactNode;
}

export const DialogButton = ({
    variant = 'secondary',
    onClick,
    className = '',
    disabled = false,
    children,
}: DialogButtonProps) => (
    <Button
        size="lg"
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
    footer: ReactNode;
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

interface InfoProps extends CoreProps {
    title?: string;
    headerIcon?: string;
    onHide: () => void;
    footer?: ReactNode;
}

export const InfoDialog = ({
    isVisible,
    title = 'Info',
    headerIcon = 'information',
    children,
    onHide,
    size,
    className,
    footer,
}: InfoProps) => (
    <GenericDialog
        closeOnEsc
        closeOnUnfocus
        onHide={onHide}
        isVisible={isVisible}
        headerIcon={headerIcon}
        title={title}
        className={className}
        size={size}
        footer={footer ?? <DialogButton onClick={onHide}>Close</DialogButton>}
    >
        {children}
    </GenericDialog>
);

export const ErrorDetails = ({ detail }: { detail: string }) => (
    <details>
        <summary>Show technical details</summary>
        <pre className="error-details tw-m-1 tw-max-h-40 tw-whitespace-pre-wrap">
            {detail}
        </pre>
    </details>
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
                {optionalLabel && (
                    <DialogButton onClick={onOptional}>
                        {optionalLabel}
                    </DialogButton>
                )}
                <DialogButton onClick={onCancel}>{cancelLabel}</DialogButton>
            </>
        }
    >
        {children}
    </GenericDialog>
);
