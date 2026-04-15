/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/**
 * Returns the signed ratio of two numbers
 *
 * A.k.a "How much greater is the maximum compared to the minimum?"
 *
 * If the returned ratio is positive, it indicates by how much `x` is greater than `y`.
 * If the returned ratio is negative, it indicates by how much `y` is greater than `x`.
 * If the returned ratio is zero, `x` is equal to `y`.
 *
 * For example, `signedRatio(500, 1500)` will return `-0.66666…`, as `y` is greater than `x`
 * by `+66.66…%` (the sign from the function indicates who is greater). `500 + 66.66…% of 1500 = 1500`.
 *
 * @param {number} x x ∈ [0; +∞)
 * @param {number} y y ∈ [0; +∞)
 * @returns {number} Signed ratio of x and y, ∈ [-1; 1]
 */
export const signedRatio = (x: number, y: number): number =>
    Math.sign(x - y) * (1 - Math.min(x, y) / Math.max(x, y));
