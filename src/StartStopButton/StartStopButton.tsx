/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, ReactNode } from 'react';

import Button, { ButtonVariants } from '../Button/Button';
import classNames from '../utils/classNames';
import playSvg from './play-circle.svg';
import stopSvg from './stop-circle.svg';

import './start-stop-button.scss';

interface Props {
    startText?: ReactNode;
    stopText?: ReactNode;
    onClick: () => void;
    started: boolean;
    disabled?: boolean;
    large?: boolean;
    variant?: ButtonVariants;
    className?: string;
}

const StartStopButton: FC<Props> = ({
    startText = 'Start',
    stopText = 'Stop',
    onClick,
    started,
    disabled = false,
    variant = 'secondary',
    className,
    large = true,
}) => {
    const label = started ? stopText : startText;
    const src = started ? stopSvg : playSvg;

    return (
        <Button
            className={classNames(
                'start-stop',
                `${started ? 'active-animation' : ''}`,
                className
            )}
            disabled={disabled}
            large={large}
            onClick={() => onClick()}
            variant={variant}
        >
            <img alt="" src={src} />
            {label}
        </Button>
    );
};

export default StartStopButton;
