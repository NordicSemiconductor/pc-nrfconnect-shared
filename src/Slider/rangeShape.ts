/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
export interface RangeProp {
    min: number;
    max: number;
    decimals?: number;
    step?: number; // positive number
    explicitRange?: number[];
}

export type Values = readonly number[];
export type NewRange = Omit<RangeProp, 'explicitRange'>;

export type RangeOrValues = NewRange | Values;

export const isValues = (
    rangeOrValues: RangeOrValues
): rangeOrValues is Values => Array.isArray(rangeOrValues);
