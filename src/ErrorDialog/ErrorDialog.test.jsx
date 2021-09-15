/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { fireEvent, waitForElementToBeRemoved } from '@testing-library/react';

import render from '../../test/testrenderer';
import ErrorDialog from './ErrorDialog';
import { showDialog } from './errorDialogActions';

describe('ErrorDialog', () => {
    it('is not rendered when there is no error', () => {
        const { queryByRole } = render(<ErrorDialog />);
        expect(queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render visible dialog with one message', () => {
        const { getByRole, queryByText } = render(<ErrorDialog />, [
            showDialog('An error occured'),
        ]);

        expect(getByRole('dialog')).toBeInTheDocument();
        expect(queryByText('An error occured')).toBeInTheDocument();
    });

    it('should render visible dialog with two messages', () => {
        const { getByRole, queryByText } = render(<ErrorDialog />, [
            showDialog('An error occured'),
            showDialog('Another error occured'),
        ]);

        expect(getByRole('dialog')).toBeInTheDocument();
        expect(queryByText('An error occured')).toBeInTheDocument();
        expect(queryByText('Another error occured')).toBeInTheDocument();
    });

    describe('has 2 close buttons', () => {
        it('with the text "Close"', () => {
            const { getAllByRole } = render(<ErrorDialog />, [
                showDialog('An error occured'),
            ]);

            const buttons = getAllByRole('button');
            expect(buttons.length).toBe(2);
            expect(buttons[0]).toHaveTextContent('Close');
            expect(buttons[1]).toHaveTextContent('Close');
        });

        const dialogAfterClickingButton = buttonNumber => {
            const { getAllByRole, getByRole } = render(<ErrorDialog />, [
                showDialog('An error occured'),
            ]);

            const buttons = getAllByRole('button');
            fireEvent.click(buttons[buttonNumber]);

            return () => getByRole('dialog');
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

        const { getByText } = render(<ErrorDialog />, [
            showDialog('An error occured', {
                'Special Handling': specialHandling,
            }),
        ]);

        fireEvent.click(getByText('Special Handling'));

        expect(specialHandling).toHaveBeenCalled();
    });
});
