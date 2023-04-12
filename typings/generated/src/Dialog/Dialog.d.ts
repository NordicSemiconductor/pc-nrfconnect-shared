import React, { ReactNode } from 'react';
import { ButtonVariants } from '../Button/Button';
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
export declare const Dialog: {
    ({ isVisible, closeOnUnfocus, onHide, className, size, children, }: DialogProps): JSX.Element;
    Header({ title, headerIcon, }: {
        title: string;
        headerIcon?: string | undefined;
    }): JSX.Element;
    Body({ children }: {
        children: ReactNode | string;
    }): JSX.Element;
    Footer({ showSpinner, children, }: {
        showSpinner?: boolean | undefined;
        children: ReactNode;
    }): JSX.Element;
};
export declare const DialogButton: ({ variant, onClick, className, disabled, children, }: {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    variant?: ButtonVariants | undefined;
    className?: string | undefined;
    disabled?: boolean | undefined;
    children: ReactNode | string;
}) => JSX.Element;
interface InfoProps extends CoreProps {
    title?: string;
    headerIcon?: string;
}
export declare const InfoDialog: ({ isVisible, title, headerIcon, children, onHide, size, className, }: InfoProps) => JSX.Element;
export declare const ErrorDialog: (props: Omit<InfoProps, 'headerIcon'>) => JSX.Element;
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
export declare const ConfirmationDialog: ({ isVisible, title, headerIcon, children, className, confirmLabel, onConfirm, cancelLabel, onCancel, optionalLabel, onOptional, size, }: ConfirmationDialogProps) => JSX.Element;
interface ProgressDialogProps extends ConfirmationDialogProps {
    progressMsg?: string;
    progress?: number;
    confirmDisabled?: boolean;
    cancelDisabled?: boolean;
    optionalDisabled?: boolean;
}
export declare const ProgressDialog: ({ isVisible, title, headerIcon, children, className, confirmLabel, confirmDisabled, onConfirm, cancelLabel, cancelDisabled, onCancel, optionalLabel, optionalDisabled, onOptional, size, progressMsg, progress, }: ProgressDialogProps) => JSX.Element;
export {};
