/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { type ReactNode } from 'react';

import AboutButton from './AboutButton';
import Section from './Section';

interface Props {
    title?: string;
    link?: string;
    linkLabel?: string;
    children?: ReactNode;
}

export default ({ title, link, linkLabel, children }: Props) => (
    <Section title={title}>
        <p>{children}</p>
        {link && <AboutButton url={link}>{linkLabel}</AboutButton>}
    </Section>
);
