/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { handle, invoke } from './infrastructure/rendererToMain';
import { AppVersions, UrlString } from './MetaFiles';
import { LOCAL, Source, SourceName } from './sources';

export interface AppSpec {
    name: string;
    source: SourceName;
}

interface BaseApp {
    name: string;
    displayName: string;
    description: string;
    iconPath: string;
}

interface Downloadable {
    source: SourceName;
    homepage?: UrlString;
    versions?: AppVersions;
    releaseNotes?: string;
    latestVersion: string;
}

interface Installed {
    currentVersion: string;
    engineVersion?: string;
    repositoryUrl?: UrlString;
    html?: string;
    installed: {
        path: string;
        shasum?: string;
    };
}

export interface LocalApp extends Installed, BaseApp {
    source: typeof LOCAL;
}

export interface InstalledDownloadableApp
    extends BaseApp,
        Installed,
        Downloadable {
    isWithdrawn: false;
}

export interface UninstalledDownloadableApp extends BaseApp, Downloadable {
    isWithdrawn: false;
}

export interface WithdrawnApp extends BaseApp, Installed, Downloadable {
    isWithdrawn: true;
}

export type DownloadableApp =
    | InstalledDownloadableApp
    | UninstalledDownloadableApp
    | WithdrawnApp;

export type LaunchableApp = LocalApp | InstalledDownloadableApp | WithdrawnApp;

export type App = LocalApp | DownloadableApp;

export interface AppWithError extends AppSpec {
    reason: unknown;
    path: string;
}

const channel = {
    getDownloadableApps: 'apps:get-downloadable-apps',
    installDownloadableApp: 'apps:install-downloadable-app',
};

export type SourceWithError = { source: Source; reason?: string };

// getDownloadableApps

export type GetDownloadableAppsResult = {
    apps: DownloadableApp[];
    appsWithErrors: AppWithError[];
    sourcesWithErrors: SourceWithError[];
};

type GetDownloadableApps = () => GetDownloadableAppsResult;

export const getDownloadableApps = invoke<GetDownloadableApps>(
    channel.getDownloadableApps
);
export const registerGetDownloadableApps = handle<GetDownloadableApps>(
    channel.getDownloadableApps
);

// installDownloadableApp
type InstallDownloadableApp = (
    app: DownloadableApp,
    version?: string
) => DownloadableApp;

export const installDownloadableApp = invoke<InstallDownloadableApp>(
    channel.installDownloadableApp
);
export const registerInstallDownloadableApp = handle<InstallDownloadableApp>(
    channel.installDownloadableApp
);
