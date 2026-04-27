/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { useDispatch, useSelector } from 'react-redux';

import Modal, { type ModalProps } from '../Modal/Modal';
import classNames from '../utils/classNames';
import {
    type ErrorMessage,
    errorResolutions as errorResolutionsSelector,
    isVisible as isVisibleSelector,
    messages as messagesSelector,
} from './errorModalSlice';
import { hideModal } from './errorModalSlice';

import styles from './ErrorModal.module.scss';

interface ErrorDetailsProps
    extends Pick<React.ComponentPropsWithRef<'details'>, 'ref' | 'className'> {
    details: string;
}

export const ErrorDetails: React.FC<ErrorDetailsProps> = ({
    details,
    ...attrs
}) => (
    <details {...attrs}>
        <summary>Show technical details</summary>
        <pre
            className={classNames(
                'error-details tw-m-1 tw-max-h-40 tw-overflow-y-auto tw-whitespace-pre-wrap',
                styles.errorDetails,
            )}
        >
            {details}
        </pre>
    </details>
);

const SingleErrorMessage = ({
    error: { message, detail },
}: {
    error: ErrorMessage;
}) => (
    <>
        <ReactMarkdown>{message}</ReactMarkdown>
        {detail && <ErrorDetails details={detail} />}
    </>
);

const MultipleErrorMessages = ({ messages }: { messages: ErrorMessage[] }) => (
    <>
        There are multiple errors:
        <ul>
            {messages.map(message => (
                <li key={message.message}>
                    <SingleErrorMessage error={message} />
                </li>
            ))}
        </ul>
    </>
);

interface ErrorModalBaseProps extends ModalProps {
    title?: string;
    footer?: ReactNode;
}

// Legacy — This and `ErrorModal` could eventually become one
export const ErrorModalBase: React.FC<
    React.PropsWithChildren<ErrorModalBaseProps>
> = ({ id, title = 'Error', footer, children, ...attrs }) => (
    <Modal id={id} {...attrs}>
        <Modal.Header>
            <span className="mdi mdi-alert" />
            <Modal.Header.Title>{title}</Modal.Header.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer className="tw-justify-end">
            {footer ?? (
                <Modal.CloseButton variant="primary" size="lg" modalId={id}>
                    Close
                </Modal.CloseButton>
            )}
        </Modal.Footer>
    </Modal>
);

type ErrorModalProps = Omit<
    ModalProps,
    'closingBehavior' | 'onClose' | 'onCancel'
>;

export const ErrorModal: React.FC<ErrorModalProps> = ({ id, ...attrs }) => {
    const dispatch = useDispatch();

    const isVisible = useSelector(isVisibleSelector);
    const messages = useSelector(messagesSelector);
    const errorResolutions = useSelector(errorResolutionsSelector);

    return (
        <ErrorModalBase
            id={id}
            closingBehavior="request"
            overrideModalState={isVisible ? 'open' : 'force-close'}
            onClose={() => dispatch(hideModal())}
            footer={
                errorResolutions &&
                Object.entries(errorResolutions).map(
                    ([label, handler], index) => (
                        <Modal.CloseButton
                            key={label}
                            onClick={handler}
                            variant={
                                index !== 0 ||
                                Object.keys(errorResolutions).length === 1
                                    ? 'secondary'
                                    : 'primary'
                            }
                            modalId={id}
                        >
                            {label}
                        </Modal.CloseButton>
                    ),
                )
            }
            {...attrs}
        >
            {messages.length === 1 ? (
                <SingleErrorMessage error={messages[0]} />
            ) : (
                <MultipleErrorMessages messages={messages} />
            )}
        </ErrorModalBase>
    );
};
