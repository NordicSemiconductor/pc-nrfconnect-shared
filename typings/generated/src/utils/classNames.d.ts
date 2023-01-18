/**
 * Combine a list of class names into a space separated strings.
 * Filters out all values that are not strings. The idea of this function is
 * to use it with conditionals and potentially unset values like this:
 *
 *     classNames(
 *          'fixed-class-name',
 *          isVisible && 'visible',
 *          isEnabled ? 'enabled' : 'disabled',
 *          potentiallyUndefined,
 *     )
 *
 * @param {...unknown} className - An arbitrary list of class names or other objects
 * @returns {string} the combined class name
 */
declare const _default: (...className: unknown[]) => string;
export default _default;
