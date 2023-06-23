/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const colors = require('./colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{html,jsx,tsx}',
        './node_modules/pc-nrfconnect-shared/src/**/*.tsx',
    ],
    theme: {
        colors,
        extend: {},
    },
    plugins: [],
};
