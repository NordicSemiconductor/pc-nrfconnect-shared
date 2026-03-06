/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import classNames from '../utils/classNames';
import flatstr from '../utils/flatstr';

export interface CardProps {
    children: React.ReactNode;
    title: React.ReactNode;
    className?: string;
}

export default ({ children, title, className }: CardProps) => (
    <article
        className={classNames(
            // prettier-ignore
            // Prettier has a bugged rule. Prettier doesn't care about multiline strings,
            // yet outputs an error on multiline strings in jsx/tsx files
            flatstr`tw-preflight tw-relative tw-flex tw-flex-col tw-gap-4 tw-break-words tw-border
            tw-border-solid tw-border-black tw-border-opacity-10 tw-bg-white tw-px-4 tw-pb-4`,
            className,
        )}
    >
        <header className="tw-border-b tw-border-solid tw-border-b-black tw-border-opacity-10 tw-py-4 tw-text-center">
            <h3 className="tw-text-base tw-font-medium">{title}</h3>
        </header>
        <div className="tw-flex tw-flex-auto">{children}</div>
    </article>
);
