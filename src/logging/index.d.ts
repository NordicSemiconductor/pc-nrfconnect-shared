/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Logger } from 'winston';

// This type definiton is only needed until the index.js in this folder
// is converted to TypeScript

declare const logger: Logger & {
    addFileTransport: (appLogDir: string) => void;
    getAndClearEntries: () => void;
    openLogFile: () => void;
};
export default logger;
