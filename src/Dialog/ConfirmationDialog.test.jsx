/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { fireEvent } from '@testing-library/react';

import render from '../../test/testrenderer';
import ConfirmationDialog from './ConfirmationDialog';

const noop = () => {};
const defaultProps = {
    isVisible: true,
    onCancel: noop,
    onOk: noop,
};

describe('ConfirmationDialog', () => {
    describe('is visible when it', () => {
        it('is rendered when visible', () => {
            const { queryByRole } = render(
                <ConfirmationDialog {...defaultProps} isVisible />
            );
            expect(queryByRole('dialog')).toBeInTheDocument();
        });

        it('is not rendered when invisible', () => {
            const { queryByRole } = render(
                <ConfirmationDialog {...defaultProps} isVisible={false} />
            );
            expect(queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    describe('shows the expected content', () => {
        it('in the title', () => {
            const title = 'a title';
            const { getByTestId } = render(
                <ConfirmationDialog {...defaultProps} title={title} />
            );

            expect(getByTestId('title').textContent).toBe(title);
        });

        it('with children', () => {
            const children = ['some', 'children'];
            const { getByText } = render(
                <ConfirmationDialog {...defaultProps}>
                    {children}
                </ConfirmationDialog>
            );

            // react-bootstrap/Modal does not allow setting a data-testid on Modal.Body,
            // so we have to search through the whole doc, but that should not be a problem here.
            expect(getByText(/some/)).toBeInTheDocument();
            expect(getByText(/children/)).toBeInTheDocument();
        });

        it('with text', () => {
            const text = 'a text';
            const { getByTestId } = render(
                <ConfirmationDialog {...defaultProps} text={text} />
            );

            expect(getByTestId('body').textContent).toBe(text);
        });
    });

    describe('can be confirmed through the Ok button', () => {
        it('invokes the expected action', () => {
            const onOkMock = jest.fn();
            const { getByText } = render(
                <ConfirmationDialog {...defaultProps} onOk={onOkMock} />
            );

            const okButton = getByText('OK');
            fireEvent.click(okButton);

            expect(onOkMock).toHaveBeenCalled();
        });
        describe('can be disabled, when it', () => {
            const isDisabledFor = props => {
                const { getByText } = render(
                    <ConfirmationDialog {...defaultProps} {...props} />
                );
                expect(getByText('OK')).toBeDisabled();
            };

            it('is in progress', () => {
                isDisabledFor({ isInProgress: true });
            });

            it('is set to be not enabled', () => {
                isDisabledFor({ isOkButtonEnabled: false });
            });

            it('is in progress and set to be not enabled', () => {
                isDisabledFor({ isInProgress: true, isOkButtonEnabled: false });
            });
        });
    });

    describe('has cancelling', () => {
        describe('through all close buttons', () => {
            it('the close button in the header', () => {
                const onCancelMock = jest.fn();
                const { getByText } = render(
                    <ConfirmationDialog
                        {...defaultProps}
                        onCancel={onCancelMock}
                    />
                );

                const closeButton = getByText('Close');
                fireEvent.click(closeButton);

                expect(onCancelMock).toHaveBeenCalled();
            });

            it('the cancel button', () => {
                const onCancelMock = jest.fn();
                const { getByText } = render(
                    <ConfirmationDialog
                        {...defaultProps}
                        onCancel={onCancelMock}
                    />
                );

                const cancelButton = getByText('Cancel');
                fireEvent.click(cancelButton);

                expect(onCancelMock).toHaveBeenCalled();
            });
        });

        it('is disabled when in progess', async () => {
            const onCancelMock = jest.fn();
            const { rerender, queryByText, getByText } = render(
                <ConfirmationDialog {...defaultProps} onCancel={onCancelMock} />
            );
            rerender(
                <ConfirmationDialog
                    {...defaultProps}
                    onCancel={onCancelMock}
                    isInProgress
                />
            );

            expect(queryByText('Close')).not.toBeInTheDocument();
            expect(getByText('Cancel')).toBeDisabled();
        });
    });
});
