/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';

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

export default Bar;
