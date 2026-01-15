/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { act, render } from '@testing-library/react';

import useStopWatch, { type ITimer, type Stopwatch } from './useStopwatch';

let appCallback = () => {};

const setup = (stopwatch: Stopwatch) => {
    const returnVal = {};
    const TestComponent = () => {
        Object.assign(returnVal, useStopWatch(stopwatch));
        return null;
    };
    render(<TestComponent />);
    return returnVal as ReturnType<typeof useStopWatch>;
};

describe('Stop Watch', () => {
    const mockNow = jest.fn(() => 0);
    const mockSetTimeout = jest.fn((callback: () => void) => {
        appCallback = callback;
        return () => {};
    });

    const timerMock: ITimer = {
        now: mockNow,
        setTimeout: mockSetTimeout,
    };

    const expectZeroElapsedTime = (
        stopwatch: ReturnType<typeof useStopWatch>,
    ) => {
        expect(stopwatch.time).toBe(0);
        expect(stopwatch.seconds).toBe(0);
        expect(stopwatch.minutes).toBe(0);
        expect(stopwatch.hours).toBe(0);
        expect(stopwatch.days).toBe(0);
    };

    beforeEach(() => {
        mockNow.mockReturnValue(0);
        jest.clearAllMocks();
    });

    test('Auto Start will init timer', () => {
        const { isRunning } = setup({
            autoStart: true,
            resolution: 1000,
            timer: timerMock,
        });

        expect(timerMock.setTimeout).toBeCalledTimes(1);
        expect(timerMock.setTimeout).toBeCalledWith(expect.anything(), 1000);
        expect(isRunning).toBeTruthy();
    });

    test('Pause will stop the stopwatch and report elapsed time', () => {
        const stopwatch = setup({
            autoStart: true,
            resolution: 1000,
            timer: timerMock,
        });

        expect(timerMock.setTimeout).toBeCalledTimes(1);
        expect(timerMock.setTimeout).toBeCalledWith(expect.anything(), 1000);
        expect(stopwatch.isRunning).toBeTruthy();

        expectZeroElapsedTime(stopwatch);

        mockNow.mockReturnValue(433);

        act(() => {
            stopwatch.pause();
        });

        expect(stopwatch.time).toBe(433);
        expect(stopwatch.seconds).toBe(0);
        expect(stopwatch.minutes).toBe(0);
        expect(stopwatch.hours).toBe(0);
        expect(stopwatch.days).toBe(0);
        expect(stopwatch.isRunning).toBeFalsy();
    });

    test('Start a paused timer will continue timer from provided time', () => {
        const stopwatch = setup({
            autoStart: true,
            resolution: 1000,
            timer: timerMock,
        });

        expect(timerMock.setTimeout).toBeCalledTimes(1);
        expect(timerMock.setTimeout).toBeCalledWith(expect.anything(), 1000);
        expect(stopwatch.isRunning).toBeTruthy();

        expectZeroElapsedTime(stopwatch);

        expect(timerMock.setTimeout).nthCalledWith(1, expect.anything(), 1000);

        mockNow.mockReturnValue(500);

        act(() => {
            stopwatch.pause();
        });

        expect(stopwatch.time).toBe(500);
        expect(stopwatch.seconds).toBe(0);
        expect(stopwatch.minutes).toBe(0);
        expect(stopwatch.hours).toBe(0);
        expect(stopwatch.days).toBe(0);
        expect(stopwatch.isRunning).toBeFalsy();

        mockNow.mockReturnValue(5000);

        act(() => {
            stopwatch.start(500);
        });

        expect(timerMock.setTimeout).toBeCalledTimes(2);
        expect(timerMock.setTimeout).nthCalledWith(2, expect.anything(), 500);
    });

    test('Timer will not automatically start', () => {
        const { isRunning } = setup({
            autoStart: false,
            resolution: 1000,
            timer: timerMock,
        });

        expect(timerMock.setTimeout).toBeCalledTimes(0);
        expect(isRunning).toBeFalsy();
    });

    test('Start call will start the timer', () => {
        const stopwatch = setup({
            autoStart: false,
            resolution: 1000,
            timer: timerMock,
        });

        expect(timerMock.setTimeout).toBeCalledTimes(0);
        expect(stopwatch.isRunning).toBeFalsy();

        mockNow.mockReturnValue(5000);

        act(() => {
            stopwatch.start();
        });

        expect(timerMock.setTimeout).toBeCalledTimes(1);
        expect(timerMock.setTimeout).toBeCalledWith(expect.anything(), 1000);
        expect(stopwatch.isRunning).toBeTruthy();
    });

    test('Reset will reset all time the stopwatch and report elapsed time', () => {
        const stopwatch = setup({
            autoStart: true,
            resolution: 1000,
            timer: timerMock,
        });

        expect(timerMock.setTimeout).toBeCalledTimes(1);
        expect(timerMock.setTimeout).nthCalledWith(1, expect.anything(), 1000);
        expect(stopwatch.isRunning).toBeTruthy();

        expectZeroElapsedTime(stopwatch);

        mockNow.mockReturnValue(1200);

        act(() => {
            appCallback();
        });

        expect(timerMock.setTimeout).nthCalledWith(2, expect.anything(), 800);

        expect(stopwatch.time).toBe(1200);
        expect(stopwatch.seconds).toBe(1);
        expect(stopwatch.minutes).toBe(0);
        expect(stopwatch.hours).toBe(0);
        expect(stopwatch.days).toBe(0);
        expect(stopwatch.isRunning).toBeTruthy();

        mockNow.mockReturnValue(6800);
        act(() => {
            stopwatch.reset();
        });

        expect(timerMock.setTimeout).nthCalledWith(3, expect.anything(), 1000);

        expectZeroElapsedTime(stopwatch);
        expect(stopwatch.isRunning).toBeTruthy();
    });

    test('Time will update output after precise interval elapsed trigger a new timeout', () => {
        const stopwatch = setup({
            autoStart: true,
            resolution: 1000,
            timer: timerMock,
        });

        expectZeroElapsedTime(stopwatch);

        // trigger timeout with precise time elapsed
        mockNow.mockReturnValue(1000);

        act(() => {
            appCallback();
        });

        expect(timerMock.setTimeout).toBeCalledTimes(2);
        expect(timerMock.setTimeout).toBeCalledWith(expect.anything(), 1000);

        expect(stopwatch.time).toBe(1000);
        expect(stopwatch.seconds).toBe(1);
        expect(stopwatch.minutes).toBe(0);
        expect(stopwatch.hours).toBe(0);
        expect(stopwatch.days).toBe(0);
    });

    test('Time will update trigger a new timeout and add positive correction', () => {
        const stopwatch = setup({
            autoStart: true,
            resolution: 1000,
            timer: timerMock,
        });

        expectZeroElapsedTime(stopwatch);

        // trigger timeout with error of -200ms
        mockNow.mockReturnValue(800);

        act(() => {
            appCallback();
        });

        expect(timerMock.setTimeout).toBeCalledTimes(2);
        expect(timerMock.setTimeout).nthCalledWith(1, expect.anything(), 1000);
        expect(timerMock.setTimeout).nthCalledWith(2, expect.anything(), 200);

        expect(stopwatch.time).toBe(800);
        expect(stopwatch.seconds).toBe(0);
        expect(stopwatch.minutes).toBe(0);
        expect(stopwatch.hours).toBe(0);
        expect(stopwatch.days).toBe(0);
    });

    test('Time will update trigger a new timeout and add negative correction', () => {
        const stopwatch = setup({
            autoStart: true,
            resolution: 1000,
            timer: timerMock,
        });

        expectZeroElapsedTime(stopwatch);

        // trigger timeout with error of +200ms
        mockNow.mockReturnValue(1200);

        act(() => {
            appCallback();
        });

        expect(timerMock.setTimeout).toBeCalledTimes(2);
        expect(timerMock.setTimeout).nthCalledWith(1, expect.anything(), 1000);
        expect(timerMock.setTimeout).nthCalledWith(2, expect.anything(), 800);

        expect(stopwatch.time).toBe(1200);
        expect(stopwatch.seconds).toBe(1);
        expect(stopwatch.minutes).toBe(0);
        expect(stopwatch.hours).toBe(0);
        expect(stopwatch.days).toBe(0);
    });

    test('Test time part splitting', () => {
        const stopwatch = setup({
            autoStart: true,
            resolution: 1000,
            timer: timerMock,
        });

        expectZeroElapsedTime(stopwatch);

        // 2days 1hr 1 min 3 seconds 500ms
        mockNow.mockReturnValue(176588500);

        act(() => {
            appCallback();
        });

        expect(stopwatch.time).toBe(176588500);
        expect(stopwatch.seconds).toBe(8);
        expect(stopwatch.minutes).toBe(3);
        expect(stopwatch.hours).toBe(1);
        expect(stopwatch.days).toBe(2);
    });
});
