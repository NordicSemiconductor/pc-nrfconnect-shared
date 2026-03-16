/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { type FC, type ReactNode } from 'react';

import Button, { type ButtonVariants } from '../Button/Button';
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
    showIcon?: boolean;
    variant?: ButtonVariants;
    className?: string;
    title?: string;
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
    showIcon = true,
    title,
}) => {
    const label = started ? stopText : startText;
    const src = started ? stopSvg : playSvg;

    return (
        <Button
            title={title}
            className={classNames(
                'start-stop',
                `${started ? 'active-animation' : ''}`,
                className,
            )}
            disabled={disabled}
            size={large ? 'lg' : 'sm'}
            onClick={() => onClick()}
            variant={variant}
        >
            {showIcon && <img alt="" src={src} />}
            {label}
        </Button>
    );
};

export default StartStopButton;
