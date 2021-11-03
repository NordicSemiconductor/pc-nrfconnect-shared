/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import Button from 'react-bootstrap/Button';
import { func, string } from 'prop-types';

import { openUrl } from '../utils/open';

interface Props {
    onClick?: () => void;
    url?: string;
    label: string;
}

const AboutButton: FC<Props> = ({ url, label, onClick }) => (
    <Button
        className="w-100"
        variant="secondary"
        disabled={!url && !onClick}
        onClick={onClick || (() => openUrl(url ?? ''))}
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
