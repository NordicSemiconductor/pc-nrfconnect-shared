/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import { func, string } from 'prop-types';

import { openUrl } from '../utils/open';

const AboutButton = ({ url, label, onClick }) => (
    <Button
        className="w-100"
        variant="secondary"
        disabled={!url && !onClick}
        onClick={onClick || (() => openUrl(url))}
    >
        {label}
    </Button>
);
AboutButton.propTypes = {
    onClick: func,
    url: string,
    label: string.isRequired,
};

export default AboutButton;
