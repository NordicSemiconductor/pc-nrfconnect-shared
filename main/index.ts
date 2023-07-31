/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { registerGetAppDetails } from '../ipc/appDetails';
import {
    registerGetDownloadableApps,
    registerInstallDownloadableApp,
} from '../ipc/apps';
import { registerOpenApp, registerOpenLauncher } from '../ipc/openWindow';
import {
    broadcastChanged,
    broadcastClosed,
    broadcastDataReceived,
    broadcastDataWritten,
    broadcastSet,
    broadcastUpdated,
    registerClose,
    registerGetOptions,
    registerIsOpen,
    registerOpen,
    registerSet,
    registerUpdate,
    registerWrite,
} from '../ipc/serialPort';

export const ipc = {
    broadcastChanged,
    broadcastClosed,
    broadcastDataReceived,
    broadcastDataWritten,
    broadcastSet,
    broadcastUpdated,
    registerClose,
    registerGetAppDetails,
    registerGetDownloadableApps,
    registerGetOptions,
    registerInstallDownloadableApp,
    registerIsOpen,
    registerOpen,
    registerOpenApp,
    registerOpenLauncher,
    registerSet,
    registerUpdate,
    registerWrite,
};
