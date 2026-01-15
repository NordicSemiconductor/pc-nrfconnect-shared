/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type winston from 'winston';

let nrfutilLogger: winston.Logger | undefined;

export const setNrfutilLogger = (logger: winston.Logger) => {
    nrfutilLogger = logger;
};

export const getNrfutilLogger = () => nrfutilLogger;
