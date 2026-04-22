/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import Button from '../Button/Button';
import { openUrl } from '../utils/open';

interface AboutButtonProps
    extends Pick<
        React.ComponentPropsWithRef<'button'>,
        'ref' | 'className' | 'onClick'
    > {
    url?: string;
}

const AboutButton: React.FC<React.PropsWithChildren<AboutButtonProps>> = ({
    url,
    onClick,
    children,
    ...attrs
}) => (
    <Button
        disabled={!url && !onClick}
        onClick={onClick || (() => openUrl(url as string))}
        variant="secondary"
        {...attrs}
    >
        {children}
    </Button>
);

export default AboutButton;
