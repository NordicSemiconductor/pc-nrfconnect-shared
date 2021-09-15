/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const ERROR_DIALOG_SHOW = 'ERROR_DIALOG_SHOW';
export const showDialog = (message, errorResolutions) => ({
    type: ERROR_DIALOG_SHOW,
    message,
    errorResolutions,
});

export const ERROR_DIALOG_HIDE = 'ERROR_DIALOG_HIDE';
export const hideDialog = () => ({ type: ERROR_DIALOG_HIDE });
