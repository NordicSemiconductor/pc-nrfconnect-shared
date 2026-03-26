import React, { type DialogHTMLAttributes } from 'react';

import Button, { type ButtonProps } from '../Button/Button';
import classNames from '../utils/classNames';

import styles from './modal.scss';

type ModalHeaderTitleProps = Pick<
    React.ComponentPropsWithRef<'h3'>,
    'ref' | 'className'
>;

type ModalHeaderTitleComponent = React.FC<
    React.PropsWithChildren<ModalHeaderTitleProps>
>;

const ModalHeaderTitle: ModalHeaderTitleComponent = ({
    className,
    children,
}) => <h3 className={classNames('tw-font-medium', className)}>{children}</h3>;

interface ModalHeaderProps
    extends Pick<React.ComponentPropsWithRef<'header'>, 'ref' | 'className'> {
    closeButton?: boolean;
    modalId?: string; // Only needed if closeButton is true
}

interface ModalHeaderComponent
    extends React.FC<React.PropsWithChildren<ModalHeaderProps>> {
    Title: ModalHeaderTitleComponent;
}

const ModalHeader: ModalHeaderComponent = ({
    closeButton = false,
    modalId,
    className,
    children,
    ...attrs
}) => (
    <header
        className={classNames(
            'tw-flex tw-flex-row tw-items-center tw-border-b tw-border-solid tw-border-b-black/10 tw-py-4',
            className,
        )}
        {...attrs}
    >
        {children}
        {closeButton && modalId && (
            <button
                type="button"
                className="tw-ml-auto tw-appearance-none"
                // @ts-expect-error command attribute does not exist
                // eslint-disable-next-line react/no-unknown-property
                command="request-close"
                // eslint-disable-next-line react/no-unknown-property
                commandfor={modalId}
            >
                <span className="mdi mdi-close" />
            </button>
        )}
    </header>
);

ModalHeader.Title = ModalHeaderTitle;

type ModalBodyComponent = React.FC<React.PropsWithChildren<ModalBodyProps>>;

type ModalBodyProps = Pick<
    React.ComponentPropsWithRef<'div'>,
    'ref' | 'className'
>;

const ModalBody: ModalBodyComponent = ({ className, children, ...attrs }) => (
    <div className={classNames('tw-flex tw-flex-col', className)} {...attrs}>
        {children}
    </div>
);

type ModalFooterProps = Pick<
    React.ComponentPropsWithRef<'footer'>,
    'ref' | 'className'
>;

type ModalFooterComponent = React.FC<React.PropsWithChildren<ModalFooterProps>>;

const ModalFooter: ModalFooterComponent = ({
    className,
    children,
    ...attrs
}) => (
    <footer
        className={classNames(
            'tw-flex tw-flex-row tw-items-center tw-justify-end tw-border-t tw-border-solid tw-border-t-black/10 tw-py-4',
            className,
        )}
        {...attrs}
    >
        {children}
    </footer>
);

interface ModalOpenButtonProps
    extends Omit<ButtonProps, 'command' | 'commandfor'> {
    modalId: string;
}

type ModalOpenButtonComponent = React.FC<
    React.PropsWithChildren<ModalOpenButtonProps>
>;

const ModalOpenButton: ModalOpenButtonComponent = ({
    children,
    modalId,
    ...attrs
}) => (
    <Button command="show-modal" commandfor={modalId} {...attrs}>
        {children}
    </Button>
);

interface ModalCloseButtonProps
    extends Omit<ButtonProps, 'command' | 'commandfor'> {
    modalId: string;
}

type ModalCloseButtonComponent = React.FC<
    React.PropsWithChildren<ModalCloseButtonProps>
>;

const ModalCloseButton: ModalCloseButtonComponent = ({
    children,
    modalId,
    ...attrs
}) => (
    <Button command="request-close" commandfor={modalId} {...attrs}>
        {children}
    </Button>
);

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

type ModalClosingBehavior = 'manual' | 'request' | 'any';

const modalClosingBehaviorLookup: Record<
    ModalClosingBehavior,
    DialogHTMLAttributes<HTMLDialogElement>['closedby']
> = {
    manual: 'none',
    request: 'closerequest',
    any: 'any',
};

interface ModalProps
    extends Pick<
        React.ComponentPropsWithRef<'dialog'>,
        'ref' | 'className' | 'onCancel' | 'onClose'
    > {
    id: string;
    modalSize?: ModalSize;
    closingBehavior: ModalClosingBehavior;
    hasBackdrop?: boolean;
}

interface ModalComponent extends React.FC<React.PropsWithChildren<ModalProps>> {
    Header: ModalHeaderComponent;
    Body: ModalBodyComponent;
    Footer: ModalFooterComponent;
    OpenButton: ModalOpenButtonComponent;
    CloseButton: ModalCloseButtonComponent;
}

const Modal: ModalComponent = ({
    className,
    children,
    id,
    modalSize = 'md',
    closingBehavior,
    hasBackdrop = true,
    ...attrs
}) => {
    const closedBy = modalClosingBehaviorLookup[closingBehavior];

    return (
        <dialog
            id={id}
            className={classNames(
                'tw-fixed tw-left-1/2 tw-m-4 -tw-translate-x-1/2 tw-p-4',
                modalSize === 'sm' && 'tw-max-w-20',
                modalSize === 'md' && 'tw-max-w-40',
                modalSize === 'lg' && 'tw-max-w-60',
                modalSize === 'xl' && 'tw-max-w-80',
                hasBackdrop && styles.backdrop,
                className,
            )}
            // eslint-disable-next-line react/no-unknown-property
            closedby={closedBy}
            {...attrs}
        >
            {children}
        </dialog>
    );
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.OpenButton = ModalOpenButton;
Modal.CloseButton = ModalCloseButton;

export default Modal;
