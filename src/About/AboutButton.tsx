/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import Button from '../Button/Button';
import { openUrl } from '../utils/open';

interface Props {
    onClick?: () => void;
    url?: string;
    label: string;
}

const AboutButton: React.FC<React.PropsWithChildren<Props>> = ({
    url,
    children,
    onClick,
}) => (
    <Button
        disabled={!url && !onClick}
        onClick={onClick || (() => openUrl(url as string))}
        variant="secondary"
    >
        {children}
    </Button>
);

export default AboutButton;
