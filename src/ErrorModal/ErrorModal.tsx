/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { type ReactNode } from 'react';

import Modal, { type ModalProps } from '../Modal/Modal';
import classNames from '../utils/classNames';

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

interface ErrorModalProps extends ModalProps {
    title?: string;
    footer?: ReactNode;
}

export const ErrorModal: React.FC<React.PropsWithChildren<ErrorModalProps>> = ({
    id,
    title = 'Error',
    footer,
    children,
    ...attrs
}) => (
    <Modal id={id} {...attrs}>
        <Modal.Header>
            <span className="mdi mdi-alert" />
            <Modal.Header.Title>{title}</Modal.Header.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer className="tw-justify-end">
            {footer ?? (
                <Modal.CloseButton
                    variant="primary-outline"
                    size="lg"
                    modalId={id}
                >
                    Close
                </Modal.CloseButton>
            )}
        </Modal.Footer>
    </Modal>
);
