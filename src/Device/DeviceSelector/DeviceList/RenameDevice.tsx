/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import PseudoButton from '../../../PseudoButton/PseudoButton';

import './rename-device.scss';

export default ({
    startEditingDeviceName,
}: {
    startEditingDeviceName: () => void;
}) => (
    <PseudoButton className="rename-button" onClick={startEditingDeviceName}>
        <span className="mdi mdi-pencil-circle pencil" />
        Rename device
    </PseudoButton>
);
