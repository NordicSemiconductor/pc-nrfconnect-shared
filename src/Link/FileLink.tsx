/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import classNames from '../utils/classNames';
import { openFile } from '../utils/open';

export default ({
    label,
    fileLocation,
}: {
    label: string;
    fileLocation: string;
}) => (
    <button
        type="button"
        onClick={() => openFile(fileLocation)}
        className={classNames(
            'tw-preflight tw-text-nordicBlue hover:tw-underline'
        )}
    >
        {label}
    </button>
);
