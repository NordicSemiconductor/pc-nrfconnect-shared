/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { ReactNode } from 'react';
import Modal from 'react-bootstrap/Modal';

import Button, { ButtonVariants } from '../Button/Button';
import StartStopButton from '../StartStopButton/StartStopButton';
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

export interface DialogButtonProps {
    onClick: () => void;
    variant?: ButtonVariants;
    className?: string;
    disabled?: boolean;
    children: ReactNode | string;
    progressButton?: boolean;
    inProgress?: boolean;
}

export const DialogButton = ({
    variant = 'secondary',
    onClick,
    className = '',
    disabled = false,
    children,
    progressButton = false,
    inProgress = false,
}: DialogButtonProps) =>
    progressButton ? (
        <StartStopButton
            large
            variant={variant}
            startText={children}
            stopText={children}
            started={inProgress}
            onClick={onClick}
            className={className}
            disabled={disabled}
            showIcon={false}
        />
    ) : (
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

interface GenericDialogProps extends Omit<CoreProps, 'onHide'> {
    title: string;
    headerIcon?: string;
    dialogButtons: DialogButtonProps[];
}

export const GenericDialog = ({
    isVisible,
    title,
    headerIcon,
    children,
    className,
    dialogButtons,
    size = 'lg',
}: GenericDialogProps) => (
    <Dialog isVisible={isVisible} className={className} size={size}>
        <Dialog.Header title={title} headerIcon={headerIcon} />
        <Dialog.Body>{children}</Dialog.Body>
        <Dialog.Footer>
            {dialogButtons.reverse().map((dialogButton, index) => (
                <DialogButton
                    key={`${index + 0}`}
                    disabled={dialogButton.disabled}
                    variant={
                        dialogButton.variant ??
                        index === dialogButtons.length - 1
                            ? 'primary'
                            : 'secondary'
                    }
                    className={dialogButton.className}
                    onClick={dialogButton.onClick}
                    progressButton={dialogButton.progressButton}
                    inProgress={dialogButton.inProgress}
                >
                    {dialogButton.children}
                </DialogButton>
            ))}
        </Dialog.Footer>
    </Dialog>
);

interface InfoProps extends CoreProps {
    title?: string;
    headerIcon?: string;
}

export const InfoDialog = ({
    isVisible,
    title = 'Info',
    headerIcon = 'info',
    children,
    onHide = () => {},
    size = 'lg',
    className,
}: InfoProps) => (
    <GenericDialog
        isVisible={isVisible}
        headerIcon={headerIcon}
        title={title}
        className={className}
        size={size}
        dialogButtons={[
            {
                onClick: onHide,
                children: 'Close',
            },
        ]}
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
    size = 'lg',
}: ConfirmationDialogProps) => {
    const buttons = [
        {
            onClick: onConfirm,
            children: confirmLabel,
        },
        {
            onClick: onCancel,
            children: cancelLabel,
        },
    ];

    if (optionalLabel) {
        buttons.push({
            onClick: onOptional,
            children: optionalLabel,
        });
    }

    return (
        <GenericDialog
            isVisible={isVisible}
            headerIcon={headerIcon}
            title={title}
            className={className}
            size={size}
            dialogButtons={buttons}
        >
            {children}
        </GenericDialog>
    );
};
