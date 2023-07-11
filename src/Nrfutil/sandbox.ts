/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    BackgroundTask,
    CancellableOperation,
    CancellablePromise,
    LogMessage,
    NrfUtilSettings,
    Progress,
    Version,
} from './sandboxTypes';

export default (
    baseDir: string,
    module: string,
    version: string,
    setting: NrfUtilSettings,
    onLogging: (logging: LogMessage) => void
) => {
    const getModuleVersion = (): Promise<Version> => {
        // fs.existsSync(path.join(baseDir, 'sandbox', module, version, `nrfutil-${module}`))
        //  ./nrfutil <module> --version --json --log-output=stdout
        // TODO
        throw new Error('Not implemented');
    };

    const isSandboxInstalled = (): Promise<boolean> => {
        // fs.existsSync(path.join(baseDir, 'sandbox', module, version, `nrfutil-${module}`))
        // Promise.resolve(getModuleVersion().version === version);
        // TODO
        throw new Error('Not implemented');
    };

    const prepareSandbox = (
        onProgress: (progress: Progress) => void
    ): CancellablePromise<boolean> => {
        // ./nrfutil install <module>=<version> --json --force --log-output=stdout
        // Error code to be 0 for success
        // TODO
        throw new Error('Not implemented');
    };

    const execSubcommand = <Result>(
        command: string,
        args: string[],
        onProgress?: (progress: Progress) => void
    ): CancellablePromise<Result> => {
        // TODO
        // ./nrfutil command args.flat() --json --log-output=stdout

        throw new Error('Not implemented');
    };

    const execBackgroundSubcommand = <Result>(
        command: string,
        args: string[],
        processors: BackgroundTask<Result>
    ): CancellableOperation => {
        // TODO
        // ./nrfutil command args.flat() --json --log-output=stdout

        // return stopFunc
        throw new Error('Not implemented');
    };
    return {
        isSandboxInstalled,
        getModuleVersion,
        prepareSandbox,
        execSubcommand,
        execBackgroundSubcommand,
    };
};
