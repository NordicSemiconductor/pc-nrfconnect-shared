/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useState } from 'react';
import { bool, func, string } from 'prop-types';

import Button from '../Button/Button';
import playSvg from './play-circle.svg';
import stopSvg from './stop-circle.svg';

import './start-stop-button.scss';

interface Props {
    startText?: string;
    stopText?: string;
    onClick: () => void;
    disabled?: boolean;
    large?: boolean;
}

const StartStopButton: FC<Props> = ({
    startText = 'Start',
    stopText = 'Stop',
    onClick,
    disabled = false,
    large = true,
}) => {
    const [showStart, setShowStart] = useState(true);
    const label = showStart ? startText : stopText;
    const src = showStart ? playSvg : stopSvg;

    return (
        <Button
            className={`start-stop  ${showStart ? '' : 'active-animation'}`}
            disabled={disabled}
            large={large}
            onClick={() => {
                setShowStart(!showStart);
                onClick();
            }}
        >
            <img alt="" src={src} />
            {label}
        </Button>
    );
};

StartStopButton.propTypes = {
    startText: string,
    stopText: string,
    onClick: func.isRequired,
    disabled: bool,
};
export default StartStopButton;
