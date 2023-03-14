/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface ITimer {
    now: () => number;
    setTimeout: (callback: () => void, ms: number) => () => void;
}

export type Stopwatch = {
    autoStart: boolean;
    resolution?: number;
    timer?: ITimer;
};

export default ({
    autoStart = false,
    timer = {
        now: () => Date.now(),
        setTimeout: (callback: () => void, ms: number) => () => {
            const t = setTimeout(callback, ms);
            return () => clearTimeout(t);
        },
    },
    resolution = 1000,
}: Stopwatch) => {
    const tickTime = useRef(timer.now());
    const expectedTickTime = useRef(-1);
    const resetFlag = useRef(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isRunning, setIsRunning] = useState(autoStart);

    const initTick = useCallback(() => {
        const offset =
            expectedTickTime.current < 0
                ? 0
                : expectedTickTime.current - timer.now();
        const interval = offset + resolution;

        expectedTickTime.current = tickTime.current + resolution;

        let complete = false;
        const handler = (delta: number) => {
            complete = true;
            setElapsedTime(elapsedTime + delta);
            tickTime.current = timer.now();
        };

        const release = timer.setTimeout(() => {
            handler(timer.now() - tickTime.current);
        }, interval);

        return () => {
            if (!complete && !resetFlag.current) {
                handler(timer.now() - tickTime.current);
                release();
            }

            resetFlag.current = false;
        };
    }, [elapsedTime, resolution, timer]);

    useEffect(() => {
        if (!isRunning) return;
        return initTick();
    }, [initTick, isRunning, timer]);

    const start = () => {
        tickTime.current = timer.now();
        setIsRunning(true);
    };

    const pause = () => {
        expectedTickTime.current = -1;
        setIsRunning(false);
    };

    const reset = () => {
        resetFlag.current = true;
        expectedTickTime.current = -1;
        tickTime.current = timer.now();
        setElapsedTime(0);
    };

    const splitMS = (ms: number) => {
        const time = ms;
        const days = Math.floor(ms / (24 * 60 * 60 * 1000));
        ms -= days * 24 * 60 * 60 * 1000;

        const hours = Math.floor(ms / (60 * 60 * 1000));
        ms -= hours * 60 * 60 * 1000;

        const minutes = Math.floor(ms / (60 * 1000));
        ms -= minutes * 60 * 1000;

        const seconds = Math.floor(ms / 1000);
        const millisecond = ms - seconds * 60 * 1000;

        return {
            time,
            days,
            hours,
            minutes,
            seconds,
            millisecond,
        };
    };

    return {
        ...splitMS(elapsedTime),
        start,
        pause,
        reset,
        isRunning,
    };
};
