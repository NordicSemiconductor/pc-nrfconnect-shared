/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import dispatchTo from '../../test/dispatchTo';
import { hideDialog, reducer, showDialog } from './errorDialogSlice';

const anErrorMessage = 'An error occurred';
const anotherErrorMessage = 'Another error occurred';

describe('errorDialogReducer', () => {
    it('is hidden by default', () => {
        const initialState = dispatchTo(reducer);

        expect(initialState.isVisible).toEqual(false);
    });

    it('shows a message', () => {
        const withAnError = dispatchTo(reducer, [
            showDialog(anErrorMessage, {}),
        ]);
        expect(withAnError.isVisible).toEqual(true);
        expect(withAnError.messages).toContainEqual({
            message: 'An error occurred',
        });
    });

    it('shows multiple messages', () => {
        const withTwoErrors = dispatchTo(reducer, [
            showDialog(anErrorMessage, {}),
            showDialog(anotherErrorMessage, {}),
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
            showDialog(anErrorMessage, {}),
            showDialog(anErrorMessage, {}),
        ]);

        expect(withAnError.messages).toEqual([
            expect.objectContaining({ message: anErrorMessage }),
        ]);
    });

    it('can be hidden and cleared', () => {
        const withAClearedError = dispatchTo(reducer, [
            showDialog(anErrorMessage, {}),
            hideDialog(),
        ]);

        expect(withAClearedError.isVisible).toEqual(false);
        expect(withAClearedError.messages.length).toEqual(0);
    });
});
