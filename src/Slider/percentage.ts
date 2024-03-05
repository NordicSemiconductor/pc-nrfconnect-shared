/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getMax, getMin, isValues, RangeOrValues } from './range';

export const constrainedToPercentage = (percentage: number) => {
    if (percentage < 0) return 0;
    if (percentage > 100) return 100;
    return percentage;
};

export const toPercentage = (value: number, rangeOrValues: RangeOrValues) => {
    if (isValues(rangeOrValues)) {
        const max = rangeOrValues.length;

        // value is an index in the case of explicit values
        return (value * 100) / max;
    }
    const min = getMin(rangeOrValues);
    const max = getMax(rangeOrValues);

    return ((value - min) * 100) / (max - min);
};

export const fromPercentage = (
    lastValue: number,
    value: number,
    rangeOrValues: RangeOrValues,
    directionForward: boolean
) => {
    const min = getMin(rangeOrValues);
    const max = getMax(rangeOrValues);

    if (isValues(rangeOrValues)) {
        const noOfIndexes = rangeOrValues.length - 1;
        const computedValue = (value / 100) * noOfIndexes;

        const lastValueIndex = lastValue;
        const closestPrevIndex = lastValueIndex === 0 ? 0 : lastValueIndex - 1;
        const closestNextIndex =
            lastValueIndex === noOfIndexes ? noOfIndexes : lastValueIndex + 1;

        let closestIndex = -1;

        if (directionForward) {
            closestIndex =
                closestNextIndex > computedValue
                    ? lastValueIndex
                    : closestNextIndex;
        } else {
            closestIndex =
                closestPrevIndex < computedValue
                    ? lastValueIndex
                    : closestPrevIndex;
        }

        console.log(computedValue, closestIndex);
        return closestIndex;
    }

    const range = rangeOrValues;
    if (range.step != null) {
        const noOfSteps = (max - min) / range.step;
        const closestStep = Math.round((value / 100) * noOfSteps);

        return Number((min + closestStep * range.step).toFixed(range.decimals));
    }

    return Number(((value * (max - min)) / 100 + min).toFixed(range.decimals));
};
