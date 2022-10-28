/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

module.exports = (path, options) =>
    options.defaultResolver(path, {
        ...options,
        packageFilter: pkg => {
            // This is a workaround for https://github.com/uuidjs/uuid/pull/616
            //
            // jest-environment-jsdom 28+ tries to use browser exports instead of default exports,
            // but uuid only offers an ESM browser export and not a CommonJS one. Jest does not yet
            // support ESM modules natively, so this causes a Jest error related to trying to parse
            // "export" syntax.
            //
            // This workaround prevents Jest from considering uuid's module-based exports at all;
            // it falls back to uuid's CommonJS+node "main" property.
            //
            // Once we're able to migrate our Jest config to ESM this can go away.
            if (pkg.name === 'uuid') {
                delete pkg.exports;
                delete pkg.module;
            }
            return pkg;
        },
    });
