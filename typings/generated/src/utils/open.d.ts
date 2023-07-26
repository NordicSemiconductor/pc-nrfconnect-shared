/**
 * Open a file in the default text application, depending on the user's OS.
 *
 * @param {string} filePath path to the file to open.
 * @returns {void}
 */
declare function openFile(filePath: string): void;
/**
 * Open a URL in the user's default web browser.
 *
 * @param {string} url The URL to open.
 * @returns {void}
 */
declare function openUrl(url: string): void;
export { openFile, openUrl };
//# sourceMappingURL=open.d.ts.map