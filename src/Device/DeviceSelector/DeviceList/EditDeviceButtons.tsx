/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import { Device } from '../../../state';
import { MakeDeviceFavorite } from '../Favorite';
import { RenameDevice } from './RenameDevice';

import './edit-device-buttons.scss';

interface Props {
    device: Device;
    startEditingDeviceName: () => void;
}

export const EditDeviceButtons: FC<Props> = ({
    device,
    startEditingDeviceName,
}) => (
    <ButtonGroup className="edit-device-buttons">
        <MakeDeviceFavorite device={device} />
        <RenameDevice startEditingDeviceName={startEditingDeviceName} />
    </ButtonGroup>
);

export default EditDeviceButtons;
