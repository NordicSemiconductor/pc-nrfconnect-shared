/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { func } from 'prop-types';

import deviceShape from '../deviceShape';
import { MakeDeviceFavorite } from '../Favorite';
import RenameDevice from './RenameDevice';

import './edit-device-buttons.scss';

const EditDeviceButtons = ({ device, startEditingDeviceName }) => (
    <ButtonGroup className="edit-device-buttons">
        <MakeDeviceFavorite device={device} />
        <RenameDevice startEditingDeviceName={startEditingDeviceName} />
    </ButtonGroup>
);

EditDeviceButtons.propTypes = {
    device: deviceShape.isRequired,
    startEditingDeviceName: func.isRequired,
};

export default EditDeviceButtons;
