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
    it('should be hidden by default', () => {
        const initialState = dispatchTo(reducer, [{ type: '@INIT' }]);

        expect(initialState.isVisible).toEqual(false);
    });

    it('should be visible and have the supplied message after show action has been dispatched', () => {
        const withAnError = dispatchTo(reducer, [
            showDialog(anErrorMessage, {}),
        ]);
        expect(withAnError.isVisible).toEqual(true);
        expect(withAnError.messages).toContain(anErrorMessage);
    });

    it('should be visible and have all messages after multiple show actions have been dispatched', () => {
        const withTwoErrors = dispatchTo(reducer, [
            showDialog(anErrorMessage, {}),
            showDialog(anotherErrorMessage, {}),
        ]);
        expect(withTwoErrors.isVisible).toEqual(true);
        expect(withTwoErrors.messages).toContain(anErrorMessage);
        expect(withTwoErrors.messages).toContain(anotherErrorMessage);
    });

    it('should not add message if it already exists in list', () => {
        const withAnError = dispatchTo(reducer, [
            showDialog(anErrorMessage, {}),
            showDialog(anErrorMessage, {}),
        ]);

        expect(withAnError.messages).toEqual([anErrorMessage]);
    });

    it('should set dialog to invisible and clear message list when hide action has been dispatched', () => {
        const withAClearedError = dispatchTo(reducer, [
            showDialog(anErrorMessage, {}),
            hideDialog(),
        ]);

        expect(withAClearedError.isVisible).toEqual(false);
        expect(withAClearedError.messages.length).toEqual(0);
    });
});
