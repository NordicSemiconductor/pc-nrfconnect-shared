import { ReactNode } from 'react';
import './dialog.scss';
export declare const Dialog: {
    ({ isVisible, closeOnUnfocus, onHide, className, children, }: {
        isVisible: boolean;
        closeOnUnfocus?: boolean | undefined;
        onHide?: (() => void) | undefined;
        className?: string | undefined;
        children: ReactNode;
    }): JSX.Element;
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
    variant?: "primary" | "secondary" | undefined;
    onClick: () => void;
    className?: string | undefined;
    disabled?: boolean | undefined;
    children: ReactNode | string;
}) => JSX.Element;
interface Props {
    isVisible: boolean;
    title?: string;
    headerIcon?: string;
    onClose: () => void;
    children: ReactNode | string;
}
export declare const InfoDialog: ({ isVisible, title, headerIcon, children, onClose, }: Props) => JSX.Element;
export declare const ErrorDialog: (props: Omit<Props, 'headerIcon'>) => JSX.Element;
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
export declare const ConfirmationDialog: ({ isVisible, title, headerIcon, children, confirmLabel, onConfirm, cancelLabel, onCancel, optionalLabel, onOptional, }: ConfirmationDialogProps) => JSX.Element;
export {};
//# sourceMappingURL=Dialog.d.ts.map