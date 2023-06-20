/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useEffect } from 'react';

import { isFactor } from './factor';

export type Values = readonly [number, ...number[]];
export type Range = {
    min: number;
    max: number;
    decimals?: number;
    step?: number; // positive number
};

export type RangeOrValues = Range | Values;

export const isValues = (
    rangeOrValues: RangeOrValues
): rangeOrValues is Values => Array.isArray(rangeOrValues);

export const getMin = (rangeOrValues: RangeOrValues) =>
    isValues(rangeOrValues) ? rangeOrValues[0] : rangeOrValues.min;

const lastValue = (rangeOrValues: Values) =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Because the array is defined to have at least one element
    rangeOrValues[rangeOrValues.length - 1]!;

export const getMax = (rangeOrValues: RangeOrValues) =>
    isValues(rangeOrValues) ? lastValue(rangeOrValues) : rangeOrValues.max;

export const getStep = (range: Range) =>
    range.step != null ? range.step : 0.1 ** (range.decimals ?? 0);

const assert = (expectedToBeTrue: boolean, warning: string) => {
    if (!expectedToBeTrue) {
        console.error(warning);
    }
};

const validateValues = (values: Values) => {
    let previousValue: Values[0] | undefined;
    values.forEach(value => {
        if (previousValue != null) {
            assert(
                previousValue < value,
                `The values of the range must be sorted correctly, but ${previousValue} is larger then ${value} in ${values}`
            );
        }
        previousValue = value;
    });
};

const validateRange = (range: Range) => {
    assert(
        !(`explicitRange` in range),
        'Using `explicitRange` is not supported anymore, use only an array instead of a range object.'
    );

    assert(
        range.min < range.max,
        `range.min must not be higher than range.max: ${JSON.stringify(range)}`
    );

    if (range.decimals != null)
        assert(
            range.decimals >= 0 && Number.isInteger(range.decimals),
            `range.decimals must be non-negative integer but is ${range.decimals}`
        );

    if (range.step != null) {
        assert(
            range.step > 0,
            `range.step must be larger than zero but is ${range.step}`
        );
        assert(
            isFactor(range.max - range.min, range.step),
            `range.step must be a factor of range.max - range.min: ${JSON.stringify(
                range
            )}`
        );
    }
};

export const useValidatedRangeOrValues = (rangeOrValues: RangeOrValues) => {
    useEffect(() => {
        if (isValues(rangeOrValues)) {
            validateValues(rangeOrValues);
        } else {
            validateRange(rangeOrValues);
        }
    }, [rangeOrValues]);
};
