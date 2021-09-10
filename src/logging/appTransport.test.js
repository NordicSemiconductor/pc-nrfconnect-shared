/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import AppTransport from './appTransport';

describe('AppTransport', () => {
    const info = {
        message: 'Foobar message',
        level: 'info',
        timestamp: '2019-07-31T11:00:42.660Z',
    };

    it('should throw error if onLogEntry is not provided to constructor', () => {
        expect(() => new AppTransport({})).toThrow();
    });

    it('should include message in log entry', () => {
        const onLogEntry = jest.fn();
        const appTransport = new AppTransport({ onLogEntry });
        const { message } = info;
        appTransport.log(info, () => {});

        expect(onLogEntry).toHaveBeenCalledWith(
            expect.objectContaining({
                message,
            })
        );
    });

    it('should include level in log entry', () => {
        const onLogEntry = jest.fn();
        const appTransport = new AppTransport({ onLogEntry });
        const { level } = info;

        appTransport.log(info, () => {});

        expect(onLogEntry).toHaveBeenCalledWith(
            expect.objectContaining({
                level,
            })
        );
    });

    it('should include timestamp in log entry', () => {
        const onLogEntry = jest.fn();
        const appTransport = new AppTransport({ onLogEntry });

        appTransport.log(info, () => {});

        expect(typeof onLogEntry.mock.calls[0][0].timestamp).toBe('string');
    });

    it('should increment the log entry id', () => {
        const onLogEntry = jest.fn();
        const appTransport = new AppTransport({ onLogEntry });

        appTransport.log(info, () => {});
        appTransport.log(info, () => {});
        appTransport.log(info, () => {});

        expect(onLogEntry.mock.calls[0][0].id).toEqual(0);
        expect(onLogEntry.mock.calls[1][0].id).toEqual(1);
        expect(onLogEntry.mock.calls[2][0].id).toEqual(2);
    });

    it('should invoke the provided callback function when log completed', () => {
        const onLogEntry = jest.fn();
        const onLogDone = jest.fn();
        const appTransport = new AppTransport({ onLogEntry });

        appTransport.log(info, onLogDone);

        expect(onLogDone).toHaveBeenCalledWith(null, true);
    });
});
