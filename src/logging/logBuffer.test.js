/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import createLogBuffer from './logBuffer';

describe('logBuffer', () => {
    let logBuffer;

    beforeEach(() => {
        logBuffer = createLogBuffer();
    });

    it('should have no entries when buffer is empty', () => {
        expect(logBuffer.size()).toEqual(0);
    });

    it('should have 1 entry when 1 entry has been added', () => {
        logBuffer.addEntry({ id: 0 });
        expect(logBuffer.size()).toEqual(1);
    });

    it('should return all added entries when clearing buffer', () => {
        const inputEntries = [{ id: 0 }, { id: 1 }];
        logBuffer.addEntry(inputEntries[0]);
        logBuffer.addEntry(inputEntries[1]);
        const outputEntries = logBuffer.clear();
        expect(outputEntries).toEqual(inputEntries);
    });

    it('should have no entries when buffer has been cleared', () => {
        logBuffer.addEntry({ id: 0 });
        logBuffer.clear();
        expect(logBuffer.size()).toEqual(0);
    });
});
