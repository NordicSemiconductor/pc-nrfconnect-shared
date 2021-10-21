/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const constrainedToPercentage = (percentage: number) => {
    if (percentage < 0) return 0;
    if (percentage > 100) return 100;
    return percentage;
};

export const toPercentage = (
    value: number,
    { min, max }: { min: number; max: number }
) => ((value - min) * 100) / (max - min);

export const fromPercentage = (
    value: number,
    { min, max, decimals = 0 }: { min: number; max: number; decimals: number }
) => Number(((value * (max - min)) / 100 + min).toFixed(decimals));
