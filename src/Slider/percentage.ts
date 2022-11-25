/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { RangeProp } from './rangeShape';

export const constrainedToPercentage = (percentage: number) => {
    if (percentage < 0) return 0;
    if (percentage > 100) return 100;
    return percentage;
};

export const toPercentage = (value: number, { min, max }: RangeProp) =>
    ((value - min) * 100) / (max - min);

export const fromPercentage = (
    lastValue: number,
    value: number,
    { min, max, decimals = 0, step = 0, explicitRange = [] }: RangeProp,
    directionForward: boolean
) => {
    if (explicitRange.length > 0) {
        const noOfIndexes = explicitRange.length - 1;
        const computedValue = Number(
            ((value * (max - min)) / 100 + min).toFixed(decimals)
        );

        const lastValueIndex = explicitRange.indexOf(lastValue);
        const closestPrevIndex = lastValueIndex === 0 ? 0 : lastValueIndex - 1;
        const closestNextIndex =
            lastValueIndex === noOfIndexes ? noOfIndexes : lastValueIndex + 1;

        let closestIndex = -1;

        if (directionForward) {
            closestIndex =
                explicitRange[closestNextIndex] > computedValue
                    ? lastValueIndex
                    : closestNextIndex;
        } else {
            closestIndex =
                explicitRange[closestPrevIndex] < computedValue
                    ? lastValueIndex
                    : closestPrevIndex;
        }

        return Number(explicitRange[closestIndex].toFixed(decimals));
    }

    if (step > 0) {
        const noOfSteps = (max - min) / step;
        const closestStep = Math.round((value / 100) * noOfSteps);

        return Number((min + closestStep * step).toFixed(decimals));
    }

    return Number(((value * (max - min)) / 100 + min).toFixed(decimals));
};
