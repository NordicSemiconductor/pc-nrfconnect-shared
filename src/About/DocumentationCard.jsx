/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import Card from '../Card/Card';
import AboutButton from './AboutButton';
import { documentationSections } from './documentationSlice';
import Section from './Section';

export default () => {
    const sections = useSelector(documentationSections);
    if (sections.length === 0) return null;

    return (
        <Card title="Documentation">
            {sections.map(section => (
                <Section key={section.props.title} title={section.props.title}>
                    <p>{section.props.children}</p>
                    {section.props.link && (
                        <AboutButton
                            url={section.props.link}
                            label={section.props.linkLabel}
                        />
                    )}
                </Section>
            ))}
        </Card>
    );
};
