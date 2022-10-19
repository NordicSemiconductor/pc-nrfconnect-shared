/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

module.exports = api => {
    const isProd = process.env.NODE_ENV === 'production';

    const plugins = [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-transform-destructuring',
        '@babel/plugin-transform-modules-commonjs',
        '@babel/plugin-transform-parameters',
        '@babel/plugin-transform-spread',
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-nullish-coalescing-operator',
        '@babel/plugin-transform-classes',
    ];

    if (!isProd) {
        // plugins.push('istanbul');
    }

    api.cache(true);

    return {
        presets: ['@babel/preset-react', '@babel/preset-typescript'],
        plugins,
    };
};
