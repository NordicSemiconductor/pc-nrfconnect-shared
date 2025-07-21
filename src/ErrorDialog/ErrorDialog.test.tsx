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

    it('renders visible dialog with one message', () => {
        render(<ErrorDialog />, [showDialog('An error occured')]);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('An error occured')).toBeInTheDocument();
    });

    it('renders visible dialog with two messages', () => {
        render(<ErrorDialog />, [
            showDialog('An error occured'),
            showDialog('Another error occured'),
        ]);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('An error occured')).toBeInTheDocument();
        expect(screen.getByText('Another error occured')).toBeInTheDocument();
    });

    describe('has a close button', () => {
        it('with the text "Close"', () => {
            render(<ErrorDialog />, [showDialog('An error occured')]);

            expect(screen.getByRole('button')).toHaveTextContent('Close');
        });

        it('of which the first closes the dialog', async () => {
            render(<ErrorDialog />, [showDialog('An error occured')]);
            fireEvent.click(screen.getByRole('button'));

            await waitForElementToBeRemoved(screen.queryByRole('dialog'));
        });
    });

    it('can have custom error resolutions', () => {
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
