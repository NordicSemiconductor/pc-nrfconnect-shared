/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    fireEvent,
    screen,
    waitForElementToBeRemoved,
} from '@testing-library/react';

import render from '../../test/testrenderer';
import ErrorDialog from './ErrorDialog';
import { showDialog } from './errorDialogSlice';

describe('ErrorDialog', () => {
    it('is not rendered when there is no error', () => {
        render(<ErrorDialog />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render visible dialog with one message', () => {
        render(<ErrorDialog />, [showDialog('An error occured')]);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('An error occured')).toBeInTheDocument();
    });

    it('should render visible dialog with two messages', () => {
        render(<ErrorDialog />, [
            showDialog('An error occured'),
            showDialog('Another error occured'),
        ]);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('An error occured')).toBeInTheDocument();
        expect(screen.getByText('Another error occured')).toBeInTheDocument();
    });

    describe('has 2 close buttons', () => {
        it('with the text "Close"', () => {
            render(<ErrorDialog />, [showDialog('An error occured')]);

            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBe(2);
            expect(buttons[0]).toHaveTextContent('Close');
            expect(buttons[1]).toHaveTextContent('Close');
        });

        const dialogAfterClickingButton = (buttonNumber: number) => {
            render(<ErrorDialog />, [showDialog('An error occured')]);

            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[buttonNumber]);

            return () => screen.getByRole('dialog');
        };

        it('of which the first closes the dialog', async () => {
            const getDialog = dialogAfterClickingButton(0);
            await waitForElementToBeRemoved(getDialog);
        });

        it('of which the second closes the dialog', async () => {
            const getDialog = dialogAfterClickingButton(1);
            await waitForElementToBeRemoved(getDialog);
        });
    });

    it('can have a custom error resolutions', () => {
        const specialHandling = jest.fn();

        render(<ErrorDialog />, [
            showDialog('An error occured', {
                'Special Handling': specialHandling,
            }),
        ]);

        fireEvent.click(screen.getByText('Special Handling'));

        expect(specialHandling).toHaveBeenCalled();
    });
});
