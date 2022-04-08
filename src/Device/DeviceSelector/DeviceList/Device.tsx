/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useRef, useState } from 'react';
import { bool, func } from 'prop-types';

import PseudoButton from '../../../PseudoButton/PseudoButton';
import { Device as DeviceProps } from '../../../state';
import classNames from '../../../utils/classNames';
import BasicDeviceInfo from '../BasicDeviceInfo';
import { FavoriteIndicator } from '../Favorite';
import EditDeviceButtons from './EditDeviceButtons';
import MoreDeviceInfo from './MoreDeviceInfo';

import './device.scss';

const ShowMoreInfo: FC<{ isVisible: boolean; toggleVisible: () => void }> = ({
    isVisible,
    toggleVisible,
}) => (
    <PseudoButton
        className={`show-more mdi mdi-chevron-${isVisible ? 'up' : 'down'}`}
        testId="show-more-device-info"
        onClick={toggleVisible}
    />
);

ShowMoreInfo.propTypes = {
    isVisible: bool.isRequired,
    toggleVisible: func.isRequired,
};

interface Props {
    device: DeviceProps;
    doSelectDevice: (device: DeviceProps) => void;
    allowMoreInfoVisible: boolean;
}

const Device: FC<Props> = ({
    device,
    doSelectDevice,
    allowMoreInfoVisible,
}) => {
    const [moreVisible, setMoreVisible] = useState(false);
    const toggleMoreVisible = () => setMoreVisible(!moreVisible);

    const deviceNameInputRef = useRef<HTMLInputElement>(null);
    const startEditingDeviceName = () => {
        deviceNameInputRef.current?.focus();
    };

    if (moreVisible && !allowMoreInfoVisible) {
        setMoreVisible(false);
    }

    return (
        <PseudoButton
            className={classNames(
                'device',
                moreVisible && 'more-infos-visible'
            )}
            onClick={() => doSelectDevice(device)}
        >
            <BasicDeviceInfo
                deviceNameInputRef={deviceNameInputRef}
                device={device}
                toggles={
                    <>
                        <FavoriteIndicator device={device} />
                        <ShowMoreInfo
                            isVisible={moreVisible}
                            toggleVisible={toggleMoreVisible}
                        />
                    </>
                }
            />
            {moreVisible && (
                <>
                    <MoreDeviceInfo device={device} />
                    <EditDeviceButtons
                        device={device}
                        startEditingDeviceName={startEditingDeviceName}
                    />
                </>
            )}
        </PseudoButton>
    );
};

export default Device;
