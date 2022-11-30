/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

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
