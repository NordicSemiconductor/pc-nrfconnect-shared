/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { hideDialog, reducer, showDialog } from './errorDialogSlice';

const initialState = reducer(undefined, { type: '' });

const anErrorMessage = 'An error occurred';
const anotherErrorMessage = 'Another error occurred';

describe('errorDialogReducer', () => {
    it('should be hidden by default', () => {
        expect(initialState.isVisible).toEqual(false);
    });

    it('should be visible and have the supplied message after show action has been dispatched', () => {
        const state = reducer(initialState, showDialog(anErrorMessage, {}));
        expect(state.isVisible).toEqual(true);
        expect(state.messages).toContain(anErrorMessage);
    });

    it('should be visible and have all messages after multiple show actions have been dispatched', () => {
        const withAnError = reducer(
            initialState,
            showDialog(anErrorMessage, {})
        );
        const withBothErrors = reducer(
            withAnError,
            showDialog(anotherErrorMessage, {})
        );
        expect(withBothErrors.isVisible).toEqual(true);
        expect(withBothErrors.messages).toContain(anErrorMessage);
        expect(withBothErrors.messages).toContain(anotherErrorMessage);
    });

    it('should not add message if it already exists in list', () => {
        const withAnError = reducer(
            initialState,
            showDialog(anErrorMessage, {})
        );
        const stillOnlyWithOneError = reducer(
            withAnError,
            showDialog(anErrorMessage, {})
        );

        expect(stillOnlyWithOneError.messages).toEqual([anErrorMessage]);
    });

    it('should set dialog to invisible and clear message list when hide action has been dispatched', () => {
        const withAnError = reducer(
            initialState,
            showDialog(anErrorMessage, {})
        );
        const cleared = reducer(withAnError, hideDialog());

        expect(cleared.isVisible).toEqual(false);
        expect(cleared.messages.length).toEqual(0);
    });
});
