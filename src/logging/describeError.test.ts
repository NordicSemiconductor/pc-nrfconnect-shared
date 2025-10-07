/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import describeError from './describeError';

describe('a reasonable string representation for an error', () => {
    it('is just that string for null or undefined', () => {
        expect(describeError(null)).toBe('null');
        expect(describeError(undefined)).toBe('undefined');
    });

    it('uses the default string representation if it is an instance of Error', () => {
        expect(describeError(URIError('Wrong'))).toBe('URIError: Wrong');
    });

    it('uses the error message if one exists', () => {
        expect(describeError({ message: 'a message' })).toBe('a message');
    });

    it('stringifies the error if it is anything else', () => {
        expect(describeError({ an: 'object' })).toBe('{"an":"object"}');
        expect(describeError('a string message')).toBe('"a string message"');
        expect(describeError(['some', 'array'])).toBe('["some","array"]');
        expect(describeError(42)).toBe('42');
    });

    it('appends the error origin', () => {
        expect(
            describeError({
                message: 'a message',
                origin: SyntaxError('something'),
            }),
        ).toBe('a message (Origin: SyntaxError: something)');
    });
});
