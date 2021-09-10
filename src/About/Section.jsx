/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { node, string } from 'prop-types';

import './section.scss';

const Section = ({ children, title }) => (
    <div className="about-section">
        {title != null && <h3 className="about-section-title">{title}</h3>}
        {children}
    </div>
);
Section.propTypes = {
    title: string,
    children: node,
};

export default Section;
