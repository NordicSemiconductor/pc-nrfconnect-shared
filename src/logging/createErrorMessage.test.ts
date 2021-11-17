/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import createErrorMessage from './createErrorMessage';

const check = (input: [string, unknown], expectedMessage: string) => {
    expect(createErrorMessage(...input)).toEqual(expectedMessage);
};

describe('creating log messages for an error 2', () => {
    it('just returns the message if the error is null or undefined', () => {
        check(['network failure', null], 'network failure');
        check(['network failure', undefined], 'network failure');
    });

    it('appends the error if it is an instance of Error', () => {
        check(
            ['specific error', URIError('Malformed')],
            'specific error: URIError: Malformed'
        );
    });

    it('appends the error message if one exists', () => {
        check(
            ['something with', { message: 'a message' }],
            'something with: a message'
        );
    });

    it('appends the stringified error if it is anything else', () => {
        check(['error', { an: 'object' }], 'error: {"an":"object"}');
        check(['error', 'a string message'], 'error: "a string message"');
        check(['error', ['some', 'array']], 'error: ["some","array"]');
        check(['error', 42], 'error: 42');
    });

    it('appends the error origin', () => {
        check(
            [
                'something with',
                { message: 'a message', origin: SyntaxError('something') },
            ],
            'something with: a message (Origin: SyntaxError: something)'
        );
    });
});
