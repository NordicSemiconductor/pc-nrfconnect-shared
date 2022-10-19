/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

module.exports = {
    all: true,
    'check-coverage': true,
    'temp-dir': 'coverage/test-e2e/.nyc_output',
    'report-dir': 'coverage/playwright-coverage',
    reporter: 'json',
    // must be overwritten by projects that do not  have src dir
    include: 'src',
    exclude: ['test-e2e'],
    branches: 30,
    lines: 30,
    functions: 20,
    statements: 30,
};
