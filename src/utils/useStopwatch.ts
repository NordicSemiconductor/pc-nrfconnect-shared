/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useRef, useState } from 'react';

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
    const autoStarted = useRef(false);
    const pauseTimeout = useRef<(() => void) | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    const nextTick = (eT: number) => {
        expectedTickTime.current =
            previousTickTime.current + (resolution - (eT % resolution));

        const nextInterval = expectedTickTime.current - timer.now();

        let complete = false;
        const handler = (delta: number, shouldContinue = true) => {
            complete = true;
            setElapsedTime(eT + delta);
            previousTickTime.current = timer.now();
            if (shouldContinue) pauseTimeout.current = nextTick(eT + delta);
        };

        const release = timer.setTimeout(() => {
            handler(timer.now() - previousTickTime.current);
        }, nextInterval);

        return () => {
            if (!complete) {
                handler(timer.now() - previousTickTime.current, false);
                release();
            }
        };
    };

    const start = (eT = elapsedTime) => {
        if (pauseTimeout.current === null) {
            previousTickTime.current = timer.now();
            expectedTickTime.current =
                timer.now() + (resolution - (eT % resolution));
            setIsRunning(true);
            pauseTimeout.current = nextTick(eT);
        }
    };

    const pause = () => {
        setIsRunning(false);
        if (pauseTimeout.current) {
            pauseTimeout.current();
            pauseTimeout.current = null;
        }
    };

    const reset = () => {
        pause();
        setElapsedTime(0);
        start(0);
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

    if (autoStart && !autoStarted.current) {
        autoStarted.current = true;
        start();
    }

    return {
        ...splitMS(elapsedTime),
        start,
        pause,
        reset,
        isRunning,
    };
};
