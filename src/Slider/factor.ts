/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// We only care about the decimals of the divisor i.e if divisor has 2 decimal points
// we will only care if the dividend up to 2 decimal points is divisable by the divisor

export const isFactor = (dividend: number, divisor: number): boolean => {
    let exp = 0;
    const originalDivisor = divisor;

    while (divisor !== Number(divisor.toFixed(0))) {
        divisor = originalDivisor;
        exp += 1;
        divisor *= 10 ** exp;
    }

    divisor = Number(divisor.toFixed(0));
    dividend = Number((dividend * 10 ** exp).toFixed(0));

    return dividend % divisor === 0;
};
