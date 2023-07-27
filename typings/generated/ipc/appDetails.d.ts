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
export declare const getAppDetails: () => Promise<AppDetailsFromLauncher>;
export declare const registerGetAppDetails: (onGetAppDetails: (webContents: WebContents) => AppDetailsFromLauncher) => void;
export {};
//# sourceMappingURL=appDetails.d.ts.map