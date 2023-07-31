/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export * as rendererToMain from './infrastructure/rendererToMain';
export * as mainToRenderer from './infrastructure/mainToRenderer';

export type {
    App,
    AppSpec,
    AppWithError,
    DownloadableApp,
    InstalledDownloadableApp,
    LaunchableApp,
    LocalApp,
    SourceWithError,
    UninstalledDownloadableApp,
    WithdrawnApp,
} from './apps';

export type { OpenAppOptions } from './openWindow';

export {
    LOCAL,
    OFFICIAL,
    allStandardSourceNames,
    type Source,
    type SourceName,
    type SourceUrl,
} from './sources';

export type { OverwriteOptions } from './serialPort';
