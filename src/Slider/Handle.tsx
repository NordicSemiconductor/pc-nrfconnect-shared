/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, MouseEventHandler, useRef, useState } from 'react';

import classNames from '../utils/classNames';
import {
    constrainedToPercentage,
    fromPercentage,
    toPercentage,
} from './percentage';
import { RangeOrValues } from './range';

import './handle.scss';

const useAutoupdatingRef = (value: (number: number) => void) => {
    const ref = useRef(value);
    if (ref.current !== value) ref.current = value;
    return ref;
};

interface Props {
    value: number;
    disabled: boolean;
    range: RangeOrValues;
    onChange: (number: number) => void;
    onChangeComplete?: () => void;
    sliderWidth?: number;
}

const noop = () => {};
const Handle: FC<Props> = ({
    value,
    disabled,
    range,
    onChange,
    onChangeComplete = noop,
    sliderWidth,
}) => {
    const [currentlyDragged, setCurrentlyDragged] = useState(false);
    const percentage = toPercentage(value, range);

    const onMouseDragStart = useRef<{
        mousePosition: number;
        percentage: number;
        lastValue: number;
    }>();

    // We have to put the callbacks into refs, so that we do not call outdated references later
    const onChangeRef = useAutoupdatingRef(onChange);
    const onChangeCompleteRef = useAutoupdatingRef(onChangeComplete);

    const grabHandle: MouseEventHandler<HTMLDivElement> = (
        event: React.MouseEvent
    ) => {
        const sliderWidthStillUnknown = sliderWidth == null;
        if (sliderWidthStillUnknown) return;

        const mousePosition = event.clientX;
        const lastValue = value;
        onMouseDragStart.current = { mousePosition, percentage, lastValue };
        setCurrentlyDragged(true);

        window.addEventListener('mousemove', dragHandle);
        window.addEventListener('mouseup', releaseHandle);
    };

    const dragHandle = (event: MouseEvent) => {
        const oldMousePosition = onMouseDragStart.current
            ?.mousePosition as number;
        const newMousePosition = event.clientX;
        const percentageChange =
            ((oldMousePosition - newMousePosition) * 100) /
            (sliderWidth as number);

        const oldPercentage = onMouseDragStart.current?.percentage as number;
        const newPercentage = constrainedToPercentage(
            oldPercentage - percentageChange
        );

        const lastValue = onMouseDragStart.current?.lastValue as number;

        const newValue = fromPercentage(
            lastValue,
            newPercentage,
            range,
            event.movementX > 0
        );
        onMouseDragStart.current = {
            mousePosition: oldMousePosition,
            percentage: oldPercentage,
            lastValue: newValue,
        };
        onChangeRef.current(newValue);
    };

    const releaseHandle = () => {
        window.removeEventListener('mousemove', dragHandle);
        window.removeEventListener('mouseup', releaseHandle);
        setCurrentlyDragged(false);
        onChangeCompleteRef.current(0);
    };

    return (
        <div
            className={classNames('handle', currentlyDragged && 'dragged')}
            style={{ left: `${percentage}%` }}
            onMouseDown={disabled ? noop : grabHandle}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
        />
    );
};

export default Handle;
