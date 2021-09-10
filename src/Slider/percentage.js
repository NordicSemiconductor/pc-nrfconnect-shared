/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const constrainedToPercentage = percentage => {
    if (percentage < 0) return 0;
    if (percentage > 100) return 100;
    return percentage;
};

export const toPercentage = (v, { min, max }) =>
    ((v - min) * 100) / (max - min);
export const fromPercentage = (v, { min, max, decimals = 0 }) =>
    Number(((v * (max - min)) / 100 + min).toFixed(decimals));
