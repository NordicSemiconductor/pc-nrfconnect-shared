/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const bleChannels = [
    37, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 38, 11, 12, 13, 14, 15, 16, 17, 18,
    19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 39,
];

Object.defineProperty(bleChannels, 'min', { value: Math.min(...bleChannels) });
Object.defineProperty(bleChannels, 'max', { value: Math.max(...bleChannels) });

Object.defineProperty(bleChannels, 'isAdvertisement', {
    value: (channel: number) => channel >= 37,
});

export default bleChannels;
