/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';

import render from '../../test/testrenderer';
import {
    ConfirmationDialog,
    Dialog,
    DialogButton,
    ErrorDialog,
    InfoDialog,
} from './Dialog';

const noop = jest.fn();
describe('Dialog', () => {
    const dialog = (isVisible = true) => (
        <Dialog isVisible={isVisible}>
            <Dialog.Header title="Test Title" />
            <Dialog.Body>Test Text</Dialog.Body>
            <Dialog.Footer>
                <DialogButton onClick={noop}>Close</DialogButton>
            </Dialog.Footer>
        </Dialog>
    );

    test('is rendered when visible', () => {
        render(dialog());
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        test;
    });

    test('is not rendered when not visible', () => {
        render(dialog(false));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('shows the expected content', () => {
        render(dialog());

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Text')).toBeInTheDocument();
        expect(screen.getByText('Close')).toBeInTheDocument();
    });
});

describe('InfoDialog creator', () => {
    const dialog = (isVisible = true) => (
        <InfoDialog isVisible={isVisible} onHide={noop}>
            Test Body
        </InfoDialog>
    );

    test('shows the expected content', () => {
        render(dialog());

        expect(screen.getByText('Info')).toBeInTheDocument();
        expect(screen.getByText('Test Body')).toBeInTheDocument();
        expect(screen.getByText('Close')).toBeInTheDocument();
    });

    test('invokes the expected action', () => {
        render(dialog());

        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(noop).toHaveBeenCalled();
    });
});

describe('ErrorDialog creator', () => {
    const dialog = (isVisible = true) => (
        <ErrorDialog isVisible={isVisible} onHide={noop}>
            Test Body
        </ErrorDialog>
    );

    test('shows the expected content', () => {
        render(dialog());

        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Test Body')).toBeInTheDocument();
        expect(screen.getByText('Close')).toBeInTheDocument();
    });

    test('invokes the expected action', () => {
        render(dialog());

        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(noop).toHaveBeenCalled();
    });
});
describe('ConfirmationDialog creator', () => {
    const dialog = (isVisible = true) => (
        <ConfirmationDialog
            isVisible={isVisible}
            confirmLabel="ConfButton"
            onConfirm={() => noop(true)}
            onCancel={() => noop(false)}
            optionalLabel="Optional"
            onOptional={() => noop()}
        >
            Test Body
        </ConfirmationDialog>
    );

    test('shows the expected content', () => {
        render(dialog());

        expect(screen.getByText('Confirm')).toBeInTheDocument();
        expect(screen.getByText('Test Body')).toBeInTheDocument();
        expect(screen.getByText('Optional')).toBeInTheDocument();
        expect(screen.getByText('ConfButton')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('invokes the expected action', () => {
        render(dialog());

        fireEvent.click(screen.getByText('Optional'));
        expect(noop).toHaveBeenCalled();
        fireEvent.click(screen.getByText('ConfButton'));
        expect(noop).toHaveBeenCalledWith(true);
        fireEvent.click(screen.getByText('Cancel'));
        expect(noop).toHaveBeenCalledWith(false);
    });
});
