/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

module.exports = api => {
    api.cache(true);
    return {
        presets: ['@babel/preset-react', '@babel/preset-typescript'],
        plugins: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-transform-destructuring',
            [
                '@babel/plugin-transform-modules-commonjs',
                {
                    allowTopLevelThis: true,
                },
            ],
            '@babel/plugin-transform-parameters',
            '@babel/plugin-transform-spread',
            '@babel/plugin-proposal-object-rest-spread',
            '@babel/plugin-proposal-optional-chaining',
            '@babel/plugin-proposal-nullish-coalescing-operator',
        ],
    };
};
