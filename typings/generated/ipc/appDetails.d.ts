import { WebContents } from 'electron';
interface AppDetails {
    coreVersion: string;
    corePath: string;
    homeDir: string;
    tmpDir: string;
    bundledJlink: string;
    path: string;
}
interface LaunchableApp {
    name?: string;
    displayName?: string;
    description?: string;
    homepage?: string;
    currentVersion?: string;
    latestVersion?: string;
    engineVersion?: string;
    iconPath?: string;
    shortcutIconPath?: string;
    isOfficial?: string;
    sharedVersion?: string;
    source?: string;
    url?: string;
    releaseNote?: string;
    upgradeAvailable?: string;
    repositoryUrl?: string;
    installed: {
        path: string;
        shasum?: string;
    };
}
export interface AppDetailsFromLauncher extends AppDetails, LaunchableApp {
}
export declare const getAppDetails: () => Promise<AppDetailsFromLauncher>;
export declare const registerGetAppDetails: (onGetAppDetails: (webContents: WebContents) => AppDetailsFromLauncher) => void;
export {};
//# sourceMappingURL=appDetails.d.ts.map