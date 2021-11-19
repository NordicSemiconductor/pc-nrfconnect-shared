/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { bool, func, string } from 'prop-types';

import playSvg from './play-circle.svg';
import stopSvg from './stop-circle.svg';

interface Props {
    startText?: string;
    stopText?: string;
    onClick: () => void;
    disabled?: boolean;
}

const StartStopButton: FC<Props> = ({
    startText = 'Start',
    stopText = 'Stop',
    onClick,
    disabled = false,
}) => {
    const [showStart, setShowStart] = useState(true);
    const label = showStart ? startText : stopText;
    const src = showStart ? playSvg : stopSvg;

    return (
        <Button
            className={`w-100 secondary-btn start-stop  ${
                showStart ? '' : 'active-animation'
            }`}
            variant="secondary"
            disabled={disabled}
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
