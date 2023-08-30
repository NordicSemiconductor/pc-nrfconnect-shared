/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import classNames from '../utils/classNames';

export default ({ label, href }: { label: string; href: string }) => (
    <a
        target="_blank"
        rel="noreferrer noopener"
        href={href}
        className={classNames(
            'tw-preflight tw-text-nordicBlue hover:tw-underline'
        )}
    >
        {label}
    </a>
);
