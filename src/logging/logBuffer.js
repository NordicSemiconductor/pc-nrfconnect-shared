/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const createLogBuffer = () => {
    const entries = [];

    const logBuffer = {};
    logBuffer.size = () => entries.length;
    logBuffer.addEntry = entry => entries.push(entry);
    logBuffer.clear = () => entries.splice(0, entries.length);

    return logBuffer;
};

export { createLogBuffer as default };
