/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { reducer as documentation } from './About/documentationSlice';
import { reducer as appLayout } from './App/appLayout';
import { reducer as appReloadDialog } from './AppReload/appReloadDialogSlice';
import { reducer as device } from './Device/deviceSlice';
import { reducer as errorDialog } from './ErrorDialog/errorDialogSlice';
import { reducer as log } from './Log/logSlice';

export default {
    appLayout,
    appReloadDialog,
    device,
    errorDialog,
    log,
    documentation,
};
