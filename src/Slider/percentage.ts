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
        const values = rangeOrValues;
        const noOfIndexes = values.length - 1;
        const computedValue = (value * (max - min)) / 100 + min;

        const lastValueIndex = values.indexOf(lastValue);
        const closestPrevIndex = lastValueIndex === 0 ? 0 : lastValueIndex - 1;
        const closestNextIndex =
            lastValueIndex === noOfIndexes ? noOfIndexes : lastValueIndex + 1;

        let closestIndex;

        if (directionForward) {
            closestIndex =
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- The computation above should make sure, that we always read at a valid index
                values[closestNextIndex]! > computedValue
                    ? lastValueIndex
                    : closestNextIndex;
        } else {
            closestIndex =
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- The computation above should make sure, that we always read at a valid index
                values[closestPrevIndex]! < computedValue
                    ? lastValueIndex
                    : closestPrevIndex;
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- The computation above should make sure, that we always read at a valid index
        return values[closestIndex]!;
    }

    const range = rangeOrValues;
    if (range.step != null) {
        const noOfSteps = (max - min) / range.step;
        const closestStep = Math.round((value / 100) * noOfSteps);

        return Number((min + closestStep * range.step).toFixed(range.decimals));
    }

    return Number(((value * (max - min)) / 100 + min).toFixed(range.decimals));
};
