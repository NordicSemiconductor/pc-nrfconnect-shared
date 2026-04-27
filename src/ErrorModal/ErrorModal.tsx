/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useSelector } from 'react-redux';

import Modal, { type ModalProps } from '../Modal/Modal';
import classNames from '../utils/classNames';
import {
    type ErrorContents,
    type ErrorResolution,
    flatErrorResolutionsSelector,
    messagesSelector,
} from './errorModalSlice';

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
                'tw-max-h-40 tw-overflow-y-auto tw-whitespace-pre-wrap tw-p-1',
                styles.errorDetails,
            )}
        >
            {details}
        </pre>
    </details>
);

interface ErrorMessageProps {
    errorContents: ErrorContents;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
    errorContents: { message, details },
}) => (
    <>
        <ReactMarkdown>{message}</ReactMarkdown>
        {details && <ErrorDetails details={details} />}
    </>
);

interface ErrorMessageListProps {
    errorContentsList: Map<string, ErrorContents>;
}

const ErrorMessageList: React.FC<ErrorMessageListProps> = ({
    errorContentsList,
}) =>
    errorContentsList.size && (
        <>
            <p>There are multiple errors:</p>
            <ul>
                {Array.from(errorContentsList.entries()).map(([key, error]) => (
                    <li key={key}>
                        <ErrorMessage errorContents={error} />
                    </li>
                ))}
            </ul>
        </>
    );

interface ErrorResolutionItemProps {
    resolution: ErrorResolution;
}

const ErrorResolutionItem: React.FC<ErrorResolutionItemProps> = ({
    resolution,
}) => resolution.description;

interface ErrorResolutionListProps {
    resolutions: Map<string, ErrorResolution>;
}

const ErrorResolutionList: React.FC<ErrorResolutionListProps> = ({
    resolutions,
}) =>
    resolutions.size && (
        <>
            <p>
                Clicking <b>Recover</b> will attempt the following:
            </p>
            <ul>
                {Array.from(resolutions.entries()).map(([key, resolution]) => (
                    <li key={key}>
                        <ErrorResolutionItem resolution={resolution} />
                    </li>
                ))}
            </ul>
        </>
    );

interface ErrorModalProps extends ModalProps {
    title?: string;
}

export const ErrorModal: React.FC<React.PropsWithChildren<ErrorModalProps>> = ({
    id,
    title = 'Error',
    children,
    ...attrs
}) => {
    // const errors: Map<string, AppError> = useSelector(errorsSelector);
    const messages: Map<string, ErrorContents> = useSelector(messagesSelector);
    const errorResolutions: Map<string, ErrorResolution> = useSelector(
        flatErrorResolutionsSelector,
    );

    return (
        <Modal id={id} {...attrs}>
            <Modal.Header>
                <span className="mdi mdi-alert" />
                <Modal.Header.Title>{title}</Modal.Header.Title>
            </Modal.Header>
            <Modal.Body>
                {children}
                <ErrorMessageList errorContentsList={messages} />
                <ErrorResolutionList resolutions={errorResolutions} />
            </Modal.Body>
            <Modal.Footer className="tw-justify-end">
                {errorResolutions.size && (
                    <Modal.CloseButton variant="primary" size="lg" modalId={id}>
                        Recover
                    </Modal.CloseButton>
                )}
                <Modal.CloseButton variant="secondary" size="lg" modalId={id}>
                    Close
                </Modal.CloseButton>
            </Modal.Footer>
        </Modal>
    );
};
