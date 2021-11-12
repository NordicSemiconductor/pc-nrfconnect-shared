/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { func } from 'prop-types';

import PseudoButton from '../../../PseudoButton/PseudoButton';

import './rename-device.scss';

export const RenameDevice: FC<{ startEditingDeviceName: () => void }> = ({
    startEditingDeviceName,
}) => (
    <PseudoButton className="rename-button" onClick={startEditingDeviceName}>
        <span className="mdi mdi-pencil-circle pencil" />
        Rename device
    </PseudoButton>
);
RenameDevice.propTypes = {
    startEditingDeviceName: func.isRequired,
};

export default RenameDevice;
