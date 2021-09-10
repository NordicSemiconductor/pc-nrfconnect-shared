/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useRef, useState } from 'react';
import { bool, func } from 'prop-types';

import PseudoButton from '../../../PseudoButton/PseudoButton';
import classNames from '../../../utils/classNames';
import BasicDeviceInfo from '../BasicDeviceInfo';
import deviceShape from '../deviceShape';
import { FavoriteIndicator } from '../Favorite';
import EditDeviceButtons from './EditDeviceButtons';
import MoreDeviceInfo from './MoreDeviceInfo';

import './device.scss';

const ShowMoreInfo = ({ isVisible, toggleVisible }) => (
    <PseudoButton
        className={`show-more mdi mdi-chevron-${isVisible ? 'up' : 'down'}`}
        onClick={toggleVisible}
    />
);

ShowMoreInfo.propTypes = {
    isVisible: bool.isRequired,
    toggleVisible: func.isRequired,
};

const Device = ({ device, doSelectDevice, allowMoreInfoVisible }) => {
    const [moreVisible, setMoreVisible] = useState(false);
    const toggleMoreVisible = () => setMoreVisible(!moreVisible);

    const deviceNameInputRef = useRef();
    const startEditingDeviceName = () => {
        deviceNameInputRef.current.focus();
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

Device.propTypes = {
    device: deviceShape.isRequired,
    doSelectDevice: func.isRequired,
    allowMoreInfoVisible: bool.isRequired,
};

export default Device;
