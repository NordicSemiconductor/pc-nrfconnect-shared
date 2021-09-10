/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { node } from 'prop-types';

import './main.scss';

const Main = ({ children }) => (
    <div className="core19-main-view">{children}</div>
);

Main.propTypes = { children: node };

export default Main;
