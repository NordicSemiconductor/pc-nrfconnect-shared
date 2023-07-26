import type { PackageJson } from './AppTypes';
/**
 * Initialize instance to send user data
 * @param {*} packageJson the app's package json
 *
 * @returns {Promise<void>} void
 */
export declare const init: (packageJson: PackageJson) => void;
/**
 * Checks if usage report instance is initialized and ready to be sent
 *
 * @returns {Boolean} returns whether the setting is on, off or undefined
 */
export declare const isInitialized: () => boolean;
/**
 * Check the status of usage data
 *
 * @returns {Boolean | undefined} returns whether the setting is on, off or undefined
 */
export declare const isEnabled: () => boolean | undefined;
/**
 * Enable sending usage data
 *
 * @returns {void}
 */
export declare const enable: () => void;
/**
 * Disable sending usage data
 *
 * @returns {void}
 */
export declare const disable: () => void;
/**
 * Reset settings so that launcher is able to
 * ask the user to enable or disable sending usage data
 *
 * @returns {void}
 */
export declare const reset: () => void;
/**
 * Send usage data event to Application Insights
 * @param {string} action The event action
 * @param {string} label The event label
 * @returns {void}
 */
export declare const sendUsageData: <T extends string>(action: T, label?: string) => void;
/**
 * Send error usage data event to Application Insights and also show it in the logger view
 * @param {string} error The event action
 * @returns {void}
 */
export declare const sendErrorReport: (error: string) => void;
declare const _default: {
    disable: () => void;
    enable: () => void;
    init: (packageJson: PackageJson) => void;
    isEnabled: () => boolean | undefined;
    isInitialized: () => boolean;
    reset: () => void;
    sendErrorReport: (error: string) => void;
    sendUsageData: <T extends string>(action: T, label?: string | undefined) => void;
};
export default _default;
//# sourceMappingURL=usageData.d.ts.map