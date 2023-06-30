/// <reference types="react" />
/**
 * Focus an element (usually an input) when a dialog becomes visible.
 * Use the concrete elements type as a type parameter.
 *
 * @param {boolean} isVisible - Whether the dialog is visible
 * @returns {React.RefObject<T>} A ref to pass to the element which should be focused
 */
declare const _default: <T extends HTMLElement>(isVisible: boolean) => import("react").RefObject<T>;
export default _default;
