/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { number, shape } from 'prop-types';

export interface RangeProp {
    min: number;
    max: number;
    decimals?: number | null;
    step?: number | null;
    explicitRange?: number[];
}

const rangeShape = shape({
    min: number.isRequired,
    max: number.isRequired,
    decimals: number,
});

export default rangeShape;
