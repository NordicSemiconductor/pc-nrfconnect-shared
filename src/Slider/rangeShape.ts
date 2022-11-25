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
