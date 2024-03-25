/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { ReactNode } from 'react';

import ApplicationCard from './ApplicationCard';
import DeviceCard from './DeviceCard';
import DocumentationCard from './DocumentationCard';
import SupportCard from './SupportCard';

import './about.scss';

interface AboutPaneProps {
    documentation?: ReactNode[];
    feedbackCategories?: string[];
}

export default ({ documentation, feedbackCategories }: AboutPaneProps) => (
    <div className="about">
        <div className="about-inner">
            <ApplicationCard />
            <DeviceCard />
            {documentation && documentation.length && (
                <DocumentationCard documentationSections={documentation} />
            )}
            <SupportCard feedbackCategories={feedbackCategories} />
        </div>
    </div>
);
