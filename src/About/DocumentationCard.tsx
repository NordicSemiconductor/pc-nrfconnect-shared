/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import Card from '../Card/Card';
import { documentationSections } from './documentationSlice';

export default () => {
    const sections = useSelector(documentationSections);
    if (sections.length === 0) return null;

    return <Card title="Documentation">{sections}</Card>;
};
