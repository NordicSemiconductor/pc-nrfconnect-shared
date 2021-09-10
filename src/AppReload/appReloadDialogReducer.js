/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    APP_RELOAD_DIALOG_HIDE,
    APP_RELOAD_DIALOG_SHOW,
} from './appReloadDialogActions';

const initialState = {
    isVisible: false,
    message: '',
};

export default (state = initialState, action) => {
    switch (action.type) {
        case APP_RELOAD_DIALOG_SHOW:
            return { ...state, isVisible: true, message: action.message };
        case APP_RELOAD_DIALOG_HIDE:
            return { ...state, isVisible: false };
        default:
            return state;
    }
};

export const isVisible = state => state.appReloadDialog.isVisible;
export const message = state => state.appReloadDialog.message;
