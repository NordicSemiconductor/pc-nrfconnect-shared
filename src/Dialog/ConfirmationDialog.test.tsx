/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';

import render from '../../test/testrenderer';
import ConfirmationDialog, {
    Props as ConfirmationDialogProps,
} from './ConfirmationDialog';

const noop = () => {};
const defaultProps = {
    isVisible: true,
    onCancel: noop,
    onOk: noop,
};

describe('ConfirmationDialog', () => {
    describe('is visible when it', () => {
        it('is rendered when visible', () => {
            render(<ConfirmationDialog {...defaultProps} isVisible />);
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        it('is not rendered when invisible', () => {
            render(<ConfirmationDialog {...defaultProps} isVisible={false} />);
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    describe('shows the expected content', () => {
        it('in the title', () => {
            const title = 'a title';
            render(<ConfirmationDialog {...defaultProps} title={title} />);

            expect(screen.getByTestId('title').textContent).toBe(title);
        });

        it('with children', () => {
            const children = ['some', 'children'];
            render(
                <ConfirmationDialog {...defaultProps}>
                    {children}
                </ConfirmationDialog>
            );

            // react-bootstrap/Modal does not allow setting a data-testid on Modal.Body,
            // so we have to search through the whole doc, but that should not be a problem here.
            expect(screen.getByText(/some/)).toBeInTheDocument();
            expect(screen.getByText(/children/)).toBeInTheDocument();
        });

        it('with text', () => {
            const text = 'a text';
            render(<ConfirmationDialog {...defaultProps} text={text} />);

            expect(screen.getByTestId('body').textContent).toBe(text);
        });
    });

    describe('can be confirmed through the Ok button', () => {
        it('invokes the expected action', () => {
            const onOkMock = jest.fn();
            render(<ConfirmationDialog {...defaultProps} onOk={onOkMock} />);

            const okButton = screen.getByText('OK');
            fireEvent.click(okButton);

            expect(onOkMock).toHaveBeenCalled();
        });
        describe('can be disabled, when it', () => {
            const isDisabledFor = (props: Partial<ConfirmationDialogProps>) => {
                render(<ConfirmationDialog {...defaultProps} {...props} />);
                expect(screen.getByText('OK')).toBeDisabled();
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
                render(
                    <ConfirmationDialog
                        {...defaultProps}
                        onCancel={onCancelMock}
                    />
                );

                const closeButton = screen.getByText('Close');
                fireEvent.click(closeButton);

                expect(onCancelMock).toHaveBeenCalled();
            });

            it('the cancel button', () => {
                const onCancelMock = jest.fn();
                render(
                    <ConfirmationDialog
                        {...defaultProps}
                        onCancel={onCancelMock}
                    />
                );

                const cancelButton = screen.getByText('Cancel');
                fireEvent.click(cancelButton);

                expect(onCancelMock).toHaveBeenCalled();
            });
        });

        it('is disabled when in progess', () => {
            const onCancelMock = jest.fn();
            const { rerender } = render(
                <ConfirmationDialog {...defaultProps} onCancel={onCancelMock} />
            );
            rerender(
                <ConfirmationDialog
                    {...defaultProps}
                    onCancel={onCancelMock}
                    isInProgress
                />
            );

            expect(screen.queryByText('Close')).not.toBeInTheDocument();
            expect(screen.getByText('Cancel')).toBeDisabled();
        });
    });
});
