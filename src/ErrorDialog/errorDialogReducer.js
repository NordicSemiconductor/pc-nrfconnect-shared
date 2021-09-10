/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ERROR_DIALOG_HIDE, ERROR_DIALOG_SHOW } from './errorDialogActions';

const initialState = {
    messages: [],
    isVisible: false,
    errorResolutions: undefined,
};

const appendIfNew = (messages, message) =>
    messages.includes(message) ? messages : [...messages, message];

export default (state = initialState, action) => {
    switch (action.type) {
        case ERROR_DIALOG_SHOW:
            return {
                ...state,
                isVisible: true,
                messages: appendIfNew(state.messages, action.message),
                errorResolutions: action.errorResolutions,
            };
        case ERROR_DIALOG_HIDE:
            return initialState;
        default:
            return state;
    }
};

export const isVisible = state => state.errorDialog.isVisible;
export const messages = state => state.errorDialog.messages;
export const errorResolutions = state => state.errorDialog.errorResolutions;
