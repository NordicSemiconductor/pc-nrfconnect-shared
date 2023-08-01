import { WebContents } from 'electron';
import { LaunchableApp } from './apps';
interface AppDetails {
    coreVersion: string;
    corePath: string;
    homeDir: string;
    tmpDir: string;
    bundledJlink: string;
    path: string;
}
export type AppDetailsFromLauncher = AppDetails & LaunchableApp;
export declare const forRenderer: {
    registerGetAppDetails: (onGetAppDetails: (webContents: WebContents) => AppDetailsFromLauncher) => void;
};
export declare const inMain: {
    getAppDetails: () => Promise<AppDetailsFromLauncher>;
};
export {};
//# sourceMappingURL=appDetails.d.ts.map