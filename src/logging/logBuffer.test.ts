/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import createLogBuffer from './logBuffer';

describe('logBuffer', () => {
    let logBuffer: ReturnType<typeof createLogBuffer>;

    beforeEach(() => {
        logBuffer = createLogBuffer();
    });

    it('is initially empty', () => {
        expect(logBuffer.size()).toEqual(0);
    });

    it('can have an entry added', () => {
        logBuffer.addEntry({ id: 0, level: '', message: '' });
        expect(logBuffer.size()).toEqual(1);
    });

    it('returns all added entries when clearing buffer', () => {
        const inputEntries = [
            { id: 0, level: '', message: '' },
            { id: 1, level: '', message: '' },
        ];
        logBuffer.addEntry(inputEntries[0]);
        logBuffer.addEntry(inputEntries[1]);
        const outputEntries = logBuffer.clear();
        expect(outputEntries).toEqual(inputEntries);
    });

    it('is empty after clearing', () => {
        logBuffer.addEntry({ id: 0, level: '', message: '' });
        logBuffer.clear();
        expect(logBuffer.size()).toEqual(0);
    });
});
