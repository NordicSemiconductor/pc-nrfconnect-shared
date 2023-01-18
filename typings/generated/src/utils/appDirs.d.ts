declare const getUserDataDir: () => any;
declare function setAppDirs(newAppDir: string, newAppDataDir: string, newAppLogDir: string): void;
/**
 * Get the filesystem path of the currently loaded app.
 *
 * @returns {string|undefined} Absolute path of current app.
 */
declare function getAppDir(): string;
/**
 * Get the filesystem path of a file for the currently loaded app.
 *
 * @param {string} filename relative name of file in the app directory
 * @returns {string|undefined} Absolute path of file.
 */
declare function getAppFile(filename: string): string;
/**
 * Get the filesystem path of the data directory of currently loaded app.
 *
 * @returns {string|undefined} Absolute path of data directory of the current app.
 */
declare function getAppDataDir(): string;
/**
 * Get the filesystem path of the log directory of currently loaded app.
 *
 * @returns {string|undefined} Absolute path of data directory of the current app.
 */
declare function getAppLogDir(): string;
export { setAppDirs, getAppDir, getAppFile, getAppDataDir, getAppLogDir, getUserDataDir, };
