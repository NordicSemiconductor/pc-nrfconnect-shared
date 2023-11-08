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
    className,
}: {
    label: string;
    fileLocation: string;
    className?: string;
}) => (
    <button
        type="button"
        onClick={() => openFile(fileLocation)}
        className={classNames(
            'tw-preflight tw-overflow-hidden tw-text-ellipsis tw-text-nordicBlue hover:tw-underline',
            className
        )}
    >
        {label}
    </button>
);
