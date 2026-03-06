/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/// Tagged function for template string which replaces series of whitespace with a single space
///
/// Template values are exempt of this transformation.
///
/// If no whitespace is introduced before or after a template value, this lack of space will reflect in the result.
/// This allows for inputting, for example, `tw-${'text'}-xl` without any issues: it results in 'tw-text-xl'.
export default (strings: TemplateStringsArray, ...values: Array<unknown>) =>
    strings
        .reduce(
            (acc, str, i) =>
                // Why no space after ${acc} and no trim after the replacement?
                // This is to properly handle cases where we have values embedded in a string with no space.
                // For example, flatstr`tw-${'text'}-xl` should result in 'tw-text-xl', while if we introduced
                // a space after the accumulator or the string, we would end up with an extra space.
                // The spaces come naturally from the string: if they are prefixed or suffixed with whitespace,
                // they will become leading/trailing spaces.
                `${acc}${str.replace(/\s+/g, ' ')}${values?.[i] ?? ''}`,
            '',
        )
        .trim();
