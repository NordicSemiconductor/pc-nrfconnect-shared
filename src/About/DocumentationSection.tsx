/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, ReactNode } from 'react';
import { node, string } from 'prop-types';

import AboutButton from './AboutButton';
import Section from './Section';

interface Props {
    title?: string;
    link?: string;
    linkLabel?: string;
    children?: ReactNode;
}

export const DocumentationSection: FC<Props> = ({
    title,
    link,
    linkLabel,
    children,
}) => (
    <Section title={title}>
        <p>{children}</p>
        {link && <AboutButton url={link} label={linkLabel ?? ''} />}
    </Section>
);

DocumentationSection.propTypes = {
    title: string,
    link: string,
    linkLabel: string,
    children: node,
};

export default DocumentationSection;
