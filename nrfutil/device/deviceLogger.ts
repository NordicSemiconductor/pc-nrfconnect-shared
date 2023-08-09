/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import winston from 'winston';

let deviceLogger: winston.Logger | undefined;

export const setDeviceLogger = (logger: winston.Logger) => {
    deviceLogger = logger;
};

export const getDeviceLogger = () => deviceLogger;
