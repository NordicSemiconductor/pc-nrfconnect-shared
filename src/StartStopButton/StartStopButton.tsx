/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';

import Button from '../Button/Button';
import classNames from '../utils/classNames';
import playSvg from './play-circle.svg';
import stopSvg from './stop-circle.svg';

import './start-stop-button.scss';

interface Props {
    startText?: string;
    stopText?: string;
    onClick: () => void;
    running: boolean;
    disabled?: boolean;
    large?: boolean;
    className?: string;
}

const StartStopButton: FC<Props> = ({
    startText = 'Start',
    stopText = 'Stop',
    onClick,
    running,
    disabled = false,
    className,
    large = true,
}) => {
    const label = running ? startText : stopText;
    const src = running ? playSvg : stopSvg;

    return (
        <Button
            className={classNames(
                'start-stop',
                `${running ? '' : 'active-animation'}`,
                className
            )}
            disabled={disabled}
            large={large}
            onClick={() => onClick()}
        >
            <img alt="" src={src} />
            {label}
        </Button>
    );
};

export default StartStopButton;
