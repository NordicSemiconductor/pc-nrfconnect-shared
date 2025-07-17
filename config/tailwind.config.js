/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const colors = require('./colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
    important: true,
    prefix: 'tw-',
    content: [
        './src/**/*.{html,jsx,tsx}',
        './node_modules/@nordicsemiconductor/pc-nrfconnect-shared/src/**/*.tsx',
    ],
    theme: {
        colors,
        extend: {
            fontSize: {
                '2xs': '0.625rem', // 10px
            },
        },
    },
    corePlugins: {
        preflight: false,
    },
    plugins: [],
};
