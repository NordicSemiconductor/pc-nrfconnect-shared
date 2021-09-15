/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import spinnerImg from './ajax-loader.gif';

export default () => (
    <img src={spinnerImg} height="16" width="16" alt="Loading..." />
);
