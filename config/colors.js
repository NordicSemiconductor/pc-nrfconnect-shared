/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
const flattenedColors = require('../src/utils/colors').colors;

const grays = Object.entries(flattenedColors)
    .filter(([key]) => key.startsWith('gray'))
    .map(([key, value]) => [key.replace('gray', ''), value]);

const colors = Object.entries(flattenedColors).filter(
    ([key]) => !key.startsWith('gray')
);

module.exports = {
    ...Object.fromEntries(colors),

    gray: {
        ...Object.fromEntries(grays),
    },
};
