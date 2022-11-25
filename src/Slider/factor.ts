/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

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
