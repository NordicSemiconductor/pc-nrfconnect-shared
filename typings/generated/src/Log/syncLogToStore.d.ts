import { TDispatch } from '../state';
/**
 * Starts syncing to new log entries from the application's log buffer.
 * Incoming entries are added to the state, so that they can be displayed
 * in the UI.
 *
 * @param {function} dispatch The redux dispatch function.
 * @returns {function(*)} Function that stops the listener.
 */
declare const _default: (dispatch: TDispatch) => () => void;
export default _default;
