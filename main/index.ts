/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const SERIALPORT_CHANNEL = {
    OPEN: 'serialport:open',
    CLOSE: 'serialport:close',
    WRITE: 'serialport:write',
    UPDATE: 'serialport:update',
    SET: 'serialport:set',

    ON_CLOSED: 'serialport:on-close',
    ON_DATA: 'serialport:on-data',
    ON_UPDATE: 'serialport:on-update',
    ON_SET: 'serialport:on-set',
    ON_CHANGED: 'serialport:on-changed',
    ON_WRITE: 'serialport:on-write',

    IS_OPEN: 'serialport:is-open',
};

export type OverwriteOptions = {
    overwrite?: boolean;
    settingsLocked?: boolean;
};
