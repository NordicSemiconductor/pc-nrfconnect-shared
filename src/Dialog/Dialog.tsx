/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { ReactNode } from 'react';
import { Form, ProgressBar } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';

import Button, { ButtonVariants } from '../Button/Button';
import Spinner from './Spinner';

import './dialog.scss';

type CoreProps = {
    isVisible: boolean;
    onHide?: () => void;
    className?: string;
    size?: 'sm' | 'lg' | 'xl';
    children: ReactNode | string;
};

type DialogProps = CoreProps & {
    closeOnUnfocus?: boolean;
};

export const Dialog = ({
    isVisible,
    closeOnUnfocus = false,
    onHide = () => {},
    className = '',
    size = 'lg',
    children,
}: DialogProps) => (
    <Modal
        show={isVisible}
        size={size}
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
    className = '',
    disabled = false,
    children,
}: {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    variant?: ButtonVariants;
    className?: string;
    disabled?: boolean;
    children: ReactNode | string;
}) => (
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

interface InfoProps extends CoreProps {
    title?: string;
    headerIcon?: string;
}

export const InfoDialog = ({
    isVisible,
    title = 'Info',
    headerIcon,
    children,
    onHide = () => {},
    size = 'lg',
    className,
}: InfoProps) => (
    <Dialog
        isVisible={isVisible}
        closeOnUnfocus
        onHide={onHide}
        className={className}
        size={size}
    >
        <Dialog.Header title={title} headerIcon={headerIcon} />
        <Dialog.Body>{children}</Dialog.Body>
        <Dialog.Footer>
            <DialogButton onClick={() => onHide()}>Close</DialogButton>
        </Dialog.Footer>
    </Dialog>
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
    onOptional,
    size = 'lg',
}: ConfirmationDialogProps) => (
    <Dialog isVisible={isVisible} className={className} size={size}>
        <Dialog.Header title={title} headerIcon={headerIcon} />
        <Dialog.Body>{children}</Dialog.Body>
        <Dialog.Footer>
            {onOptional && optionalLabel && (
                <DialogButton onClick={onOptional}>
                    {optionalLabel}
                </DialogButton>
            )}
            <DialogButton onClick={onConfirm} variant="primary">
                {confirmLabel}
            </DialogButton>
            <DialogButton onClick={onCancel}>{cancelLabel}</DialogButton>
        </Dialog.Footer>
    </Dialog>
);

interface ProgressDialogProps extends ConfirmationDialogProps {
    progress?: number;
    confirmDisabled?: boolean;
    cancelDisabled?: boolean;
    optionalDisabled?: boolean;
}

export const ProgressDialog = ({
    isVisible,
    title = 'Confirm',
    headerIcon,
    children,
    className,
    confirmLabel = 'Confirm',
    confirmDisabled,
    onConfirm,
    cancelLabel = 'Cancel',
    cancelDisabled,
    onCancel,
    optionalLabel,
    optionalDisabled,
    onOptional,
    size = 'lg',
    progress,
}: ProgressDialogProps) => (
    <Dialog isVisible={isVisible} className={className} size={size}>
        <Dialog.Header title={title} headerIcon={headerIcon} />
        <Dialog.Body>
            <>
                {children}
                {progress === undefined && (
                    <Form.Group>
                        <br />
                        <ProgressBar
                            animated
                            now={progress}
                            label={`${progress}%`}
                        />
                    </Form.Group>
                )}
            </>
        </Dialog.Body>
        <Dialog.Footer>
            {onOptional && optionalLabel && (
                <DialogButton disabled={optionalDisabled} onClick={onOptional}>
                    {optionalLabel}
                </DialogButton>
            )}
            <DialogButton
                disabled={confirmDisabled}
                onClick={onConfirm}
                variant="primary"
            >
                {confirmLabel}
            </DialogButton>
            <DialogButton disabled={cancelDisabled} onClick={onCancel}>
                {cancelLabel}
            </DialogButton>
        </Dialog.Footer>
    </Dialog>
);
