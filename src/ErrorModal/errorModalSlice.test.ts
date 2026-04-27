/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import dispatchTo from '../../test/dispatchTo';
import { hideModal, reducer, showModal } from './errorModalSlice';

const anErrorMessage = 'An error occurred';
const anotherErrorMessage = 'Another error occurred';

describe('errorModalReducer', () => {
    it('is hidden by default', () => {
        const initialState = dispatchTo(reducer);

        expect(initialState.isVisible).toEqual(false);
    });

    it('shows a message', () => {
        const withAnError = dispatchTo(reducer, [
            showModal(anErrorMessage, {}),
        ]);
        expect(withAnError.isVisible).toEqual(true);
        expect(withAnError.messages).toContainEqual({
            message: 'An error occurred',
        });
    });

    it('shows multiple messages', () => {
        const withTwoErrors = dispatchTo(reducer, [
            showModal(anErrorMessage, {}),
            showModal(anotherErrorMessage, {}),
        ]);
        expect(withTwoErrors.isVisible).toEqual(true);
        expect(withTwoErrors.messages).toContainEqual({
            message: anErrorMessage,
        });
        expect(withTwoErrors.messages).toContainEqual({
            message: anotherErrorMessage,
        });
    });

    it('does not show duplicate messages', () => {
        const withAnError = dispatchTo(reducer, [
            showModal(anErrorMessage, {}),
            showModal(anErrorMessage, {}),
        ]);

        expect(withAnError.messages).toEqual([
            expect.objectContaining({ message: anErrorMessage }),
        ]);
    });

    it('can be hidden and cleared', () => {
        const withAClearedError = dispatchTo(reducer, [
            showModal(anErrorMessage, {}),
            hideModal(),
        ]);

        expect(withAClearedError.isVisible).toEqual(false);
        expect(withAClearedError.messages.length).toEqual(0);
    });
});
