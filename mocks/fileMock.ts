/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// Allows jest to test files that import images, fonts, etc. Jest cannot
// parse things like this, so we have to mock them. This mock just returns
// 'test-file-stub' for files that match the moduleNameMapper expression
// in package.json.
// Ref: https://facebook.github.io/jest/docs/tutorial-webpack.html

export default 'test-file-stub';
