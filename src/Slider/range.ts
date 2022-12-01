/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useEffect } from 'react';

import { isFactor } from './factor';

export type Values = readonly number[];
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

export const getMax = (rangeOrValues: RangeOrValues) =>
    isValues(rangeOrValues)
        ? rangeOrValues[rangeOrValues.length - 1]
        : rangeOrValues.max;

export const getStep = (range: Range) =>
    range.step != null ? range.step : 0.1 ** (range.decimals ?? 0);

const validateValues = (values: Values) => {
    for (let i = 0; i < values.length - 1; i += 1) {
        if (values[i] > values[i + 1]) {
            console.error(
                `The values of the range must be sorted correctly, but ${
                    values[i]
                } is larger then ${values[i + 1]} in ${values}`
            );
        }
    }
};

const validateRange = (range: Range) => {
    if (range.min > range.max)
        console.error(
            `range.min must not be higher than range.max: ${JSON.stringify(
                range
            )}`
        );

    if (range.step != null) {
        if (!isFactor(range.min, range.step))
            console.error(
                `range.step must be a factor of range.min: ${JSON.stringify(
                    range
                )}`
            );
        if (!isFactor(range.max, range.step))
            console.error(
                `range.step must be a factor of range.max: ${JSON.stringify(
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
