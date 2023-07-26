import { ReactNode } from 'react';
import { ButtonVariants } from '../Button/Button';
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
export declare const Dialog: {
    ({ isVisible, closeOnUnfocus, closeOnEsc, onHide, className, size, children, }: DialogProps): JSX.Element;
    Header({ title, headerIcon, showSpinner, }: {
        title: string;
        headerIcon?: string | undefined;
        showSpinner?: boolean | undefined;
    }): JSX.Element;
    Body({ children }: {
        children: ReactNode;
    }): JSX.Element;
    Footer({ children }: {
        children: ReactNode;
    }): JSX.Element;
};
export interface DialogButtonProps {
    onClick: () => void;
    variant?: ButtonVariants;
    className?: string;
    disabled?: boolean;
    children: ReactNode;
}
export declare const DialogButton: ({ variant, onClick, className, disabled, children, }: DialogButtonProps) => JSX.Element;
interface GenericDialogProps extends CoreProps {
    title: string;
    footer: ReactNode;
    headerIcon?: string;
    showSpinner?: boolean;
    closeOnUnfocus?: boolean;
    closeOnEsc?: boolean;
}
export declare const GenericDialog: ({ isVisible, onHide, title, headerIcon, children, className, footer, showSpinner, closeOnUnfocus, closeOnEsc, size, }: GenericDialogProps) => JSX.Element;
interface InfoProps extends CoreProps {
    title?: string;
    headerIcon?: string;
    onHide: () => void;
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
export {};
//# sourceMappingURL=Dialog.d.ts.map