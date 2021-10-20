/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { number, shape } from 'prop-types';

export default shape({
    min: number.isRequired,
    max: number.isRequired,
    decimals: number,
});
