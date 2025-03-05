/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import telemetry from '../telemetry/telemetry';
import classNames from '../utils/classNames';

export default ({ href, label = href }: { href: string; label?: string }) => (
    <a
        target="_blank"
        rel="noreferrer noopener"
        href={href}
        className={classNames(
            'tw-preflight tw-text-nordicBlue hover:tw-underline'
        )}
        onClick={event => {
            telemetry.sendEvent('Visiting link', { href });
            event.stopPropagation();
        }}
    >
        {label}
    </a>
);
