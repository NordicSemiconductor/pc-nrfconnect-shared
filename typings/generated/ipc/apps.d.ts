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
export interface InstalledDownloadableApp extends BaseApp, Installed, Downloadable {
    isWithdrawn: false;
}
export interface UninstalledDownloadableApp extends BaseApp, Downloadable {
    isWithdrawn: false;
}
export interface WithdrawnApp extends BaseApp, Installed, Downloadable {
    isWithdrawn: true;
}
export type DownloadableApp = InstalledDownloadableApp | UninstalledDownloadableApp | WithdrawnApp;
export type LaunchableApp = LocalApp | InstalledDownloadableApp | WithdrawnApp;
export type App = LocalApp | DownloadableApp;
export interface AppWithError extends AppSpec {
    reason: unknown;
    path: string;
}
export type SourceWithError = {
    source: Source;
    reason?: string;
};
type GetDownloadableAppsResult = {
    apps: DownloadableApp[];
    appsWithErrors: AppWithError[];
    sourcesWithErrors: SourceWithError[];
};
export declare const forRenderer: {
    registerGetDownloadableApps: (handler: (() => GetDownloadableAppsResult) | (() => Promise<GetDownloadableAppsResult>)) => void;
    registerInstallDownloadableApp: (handler: ((app: DownloadableApp, version?: string | undefined) => DownloadableApp) | ((app: DownloadableApp, version?: string | undefined) => Promise<DownloadableApp>)) => void;
};
export declare const inMain: {
    getDownloadableApps: () => Promise<GetDownloadableAppsResult>;
    installDownloadableApp: (app: DownloadableApp, version?: string | undefined) => Promise<DownloadableApp>;
};
export {};
//# sourceMappingURL=apps.d.ts.map