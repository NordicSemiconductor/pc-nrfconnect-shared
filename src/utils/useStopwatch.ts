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

const defaultTimer: ITimer = {
    now: () => Date.now(),
    setTimeout: (callback: () => void, ms: number) => {
        const t = setTimeout(callback, ms);
        return () => clearTimeout(t);
    },
};

export default ({
    autoStart = false,
    timer = defaultTimer,
    resolution = 1000,
}: Stopwatch) => {
    const previousTickTime = useRef(timer.now());
    const expectedTickTime = useRef(-1);
    const resetFlag = useRef(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isRunning, setIsRunning] = useState(autoStart);

    const initTick = useCallback(() => {
        expectedTickTime.current =
            previousTickTime.current +
            (resolution - (elapsedTime % resolution));

        const nextInterval = expectedTickTime.current - timer.now();

        let complete = false;
        const handler = (delta: number) => {
            complete = true;
            setElapsedTime(elapsedTime + delta);
            previousTickTime.current = timer.now();
        };

        const release = timer.setTimeout(() => {
            handler(timer.now() - previousTickTime.current);
        }, nextInterval);

        return () => {
            if (!complete && !resetFlag.current) {
                handler(timer.now() - previousTickTime.current);
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
        previousTickTime.current = timer.now();
        expectedTickTime.current =
            timer.now() + (resolution - (elapsedTime % resolution));
        setIsRunning(true);
    };

    const pause = () => {
        setIsRunning(false);
    };

    const reset = () => {
        resetFlag.current = true;
        expectedTickTime.current = -1;
        previousTickTime.current = timer.now();
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
