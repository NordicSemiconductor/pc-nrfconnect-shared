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

const splitMS = (ms: number) => {
    const time = ms;
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    ms -= days * 24 * 60 * 60 * 1000;

    const hours = Math.floor(ms / (60 * 60 * 1000));
    ms -= hours * 60 * 60 * 1000;

    const minutes = Math.floor(ms / (60 * 1000));
    ms -= minutes * 60 * 1000;

    const seconds = Math.floor(ms / 1000);
    const millisecond = ms - seconds * 1000;

    return {
        time,
        days,
        hours,
        minutes,
        seconds,
        millisecond,
    };
};

export default ({
    autoStart = false,
    timer = defaultTimer,
    resolution = 1000,
}: Stopwatch) => {
    const previousTickTime = useRef(timer.now());
    const expectedTickTime = useRef(-1);
    const autoStarted = useRef(false);
    const pauseTimeout = useRef<(() => void) | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [time, setTime] = useState(0);

    const nextTick = useCallback(
        (elapsedTime: number) => {
            expectedTickTime.current =
                previousTickTime.current +
                (resolution - (elapsedTime % resolution));

            const nextInterval = expectedTickTime.current - timer.now();

            const handler = (delta: number, shouldContinue = true) => {
                setTime(elapsedTime + delta);
                previousTickTime.current = timer.now();
                if (shouldContinue)
                    pauseTimeout.current = nextTick(elapsedTime + delta);
            };

            const release = timer.setTimeout(() => {
                handler(timer.now() - previousTickTime.current);
            }, nextInterval);

            return () => {
                handler(timer.now() - previousTickTime.current, false);
                release();
            };
        },
        [resolution, timer]
    );

    const start = useCallback(
        (elapsedTime = 0) => {
            if (pauseTimeout.current === null) {
                previousTickTime.current = timer.now();
                expectedTickTime.current =
                    timer.now() + (resolution - (elapsedTime % resolution));
                setIsRunning(true);
                pauseTimeout.current = nextTick(elapsedTime);
            }
        },
        [nextTick, resolution, timer]
    );

    const pause = useCallback(() => {
        setIsRunning(false);
        if (pauseTimeout.current) {
            pauseTimeout.current();
            pauseTimeout.current = null;
        }
    }, []);

    const reset = useCallback(() => {
        pause();
        setTime(0);
        start(0);
    }, [pause, start]);

    useEffect(
        () => () => {
            if (pauseTimeout.current) {
                pauseTimeout.current();
                pauseTimeout.current = null;
            }
        },
        []
    );

    if (autoStart && !autoStarted.current) {
        autoStarted.current = true;
        start(0);
    }

    return {
        ...splitMS(time),
        start,
        pause,
        reset,
        isRunning,
    };
};
