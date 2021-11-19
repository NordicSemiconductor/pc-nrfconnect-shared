/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { number } from 'prop-types';

import './bar.scss';

const Bar: FC<{ start: number; end: number }> = ({ start, end }) => (
    <>
        <div className="bar background" />
        <div
            className="bar foreground"
            style={{
                left: `${start}%`,
                width: `${end - start}%`,
            }}
        />
    </>
);
Bar.propTypes = {
    start: number.isRequired,
    end: number.isRequired,
};

export default Bar;
