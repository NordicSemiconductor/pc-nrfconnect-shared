/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { node, string } from 'prop-types';

import AboutButton from './AboutButton';
import Section from './Section';

export const DocumentationSection = ({ title, link, linkLabel, children }) => (
    <Section title={title}>
        <p>{children}</p>
        {link && <AboutButton url={link} label={linkLabel} />}
    </Section>
);

DocumentationSection.propTypes = {
    title: string,
    link: string,
    linkLabel: string,
    children: node,
};

export default DocumentationSection;
