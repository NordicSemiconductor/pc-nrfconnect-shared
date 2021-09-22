/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { reducer as appLayout } from './App/appLayout';
import { reducer as appReloadDialog } from './AppReload/appReloadDialogSlice';
import device from './Device/deviceReducer';
import errorDialog from './ErrorDialog/errorDialogReducer';
import log from './Log/logReducer';

export default {
    appLayout,
    appReloadDialog,
    device,
    errorDialog,
    log,
};
