/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
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
import { ErrorModal } from './ErrorModal';
import { showModal } from './errorModalSlice';

describe('ErrorModal', () => {
    it('is not rendered when there is no error', () => {
        render(<ErrorModal />);
        expect(screen.queryByRole('modal')).not.toBeInTheDocument();
    });

    it('renders visible modal with one message', () => {
        render(<ErrorModal />, [showModal('An error occured')]);

        expect(screen.getByRole('modal')).toBeInTheDocument();
        expect(screen.getByText('An error occured')).toBeInTheDocument();
    });

    it('renders visible modal with two messages', () => {
        render(<ErrorModal />, [
            showModal('An error occured'),
            showModal('Another error occured'),
        ]);

        expect(screen.getByRole('modal')).toBeInTheDocument();
        expect(screen.getByText('An error occured')).toBeInTheDocument();
        expect(screen.getByText('Another error occured')).toBeInTheDocument();
    });

    describe('has a close button', () => {
        it('with the text "Close"', () => {
            render(<ErrorModal />, [showModal('An error occured')]);

            expect(screen.getByRole('button')).toHaveTextContent('Close');
        });

        it('of which the first closes the modal', async () => {
            render(<ErrorModal />, [showModal('An error occured')]);
            fireEvent.click(screen.getByRole('button'));

            await waitForElementToBeRemoved(screen.queryByRole('modal'));
        });
    });

    it('can have custom error resolutions', () => {
        const specialHandling = jest.fn();

        render(<ErrorModal />, [
            showModal('An error occured', {
                'Special Handling': specialHandling,
            }),
        ]);

        fireEvent.click(screen.getByText('Special Handling'));

        expect(specialHandling).toHaveBeenCalled();
    });
});
