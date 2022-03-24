/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { func, string } from 'prop-types';

import Button from '../Button/Button';
import { openUrl } from '../utils/open';

interface Props {
    onClick?: () => void;
    url?: string;
    label: string;
}

const AboutButton: FC<Props> = ({ url, label, onClick }) => (
    <Button
        disabled={!url && !onClick}
        onClick={onClick || (() => openUrl(url as string))}
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
