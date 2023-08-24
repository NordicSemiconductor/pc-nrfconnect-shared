/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { LogLevel, LogMessage } from '../sandboxTypes';
import { Batch } from './batch';
import { getDeviceSandbox } from './common';
import erase from './erase';
import firmwareRead from './firmwareRead';
import getCoreInfo from './getCoreInfo';
import getFwInfo from './getFwInfo';
import getProtectionStatus from './getProtectionStatus';
import list from './list';
import program from './program';
import recover from './recover';
import reset from './reset';
import setMcuState from './setMcuState';
import setProtectionStatus from './setProtectionStatus';

const onLogging = async (handler: (logging: LogMessage) => void) => {
    const sandbox = await getDeviceSandbox();
    return sandbox.onLogging(handler);
};

const setLogLevel = async (level: LogLevel) => {
    const sandbox = await getDeviceSandbox();
    sandbox.setLogLevel(level);
};

const setVerboseLogging = async (verbose: boolean) => {
    const sandbox = await getDeviceSandbox();
    if (process.env.NODE_ENV === 'production' && !verbose) {
        sandbox.setLogLevel('off');
    } else {
        sandbox.setLogLevel(verbose ? 'trace' : 'error');
    }
};
const getModuleVersion = async () => {
    const sandbox = await getDeviceSandbox();
    return sandbox.getModuleVersion();
};

export default {
    program,
    erase,
    recover,
    reset,
    getProtectionStatus,
    setProtectionStatus,
    getFwInfo,
    setMcuState,
    getCoreInfo,
    list,
    firmwareRead,
    onLogging,
    setLogLevel,
    setVerboseLogging,
    getModuleVersion,
    batch: () => new Batch(),
};
