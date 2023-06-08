/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useRef, useState } from 'react';

import PseudoButton from '../../../PseudoButton/PseudoButton';
import classNames from '../../../utils/classNames';
import { Device as DeviceProps } from '../../deviceSlice';
import BasicDeviceInfo from '../BasicDeviceInfo';
import { FavoriteIndicator } from '../Favorite';
import EditDeviceButtons from './EditDeviceButtons';
import MoreDeviceInfo from './MoreDeviceInfo';

import './device.scss';

const ShowMoreInfo = ({
    isVisible,
    toggleVisible,
}: {
    isVisible: boolean;
    toggleVisible: () => void;
}) => (
    <PseudoButton
        className={`show-more mdi mdi-chevron-${isVisible ? 'up' : 'down'}`}
        testId="show-more-device-info"
        onClick={toggleVisible}
    />
);

interface Props {
    device: DeviceProps;
    doSelectDevice: (device: DeviceProps, autoReselected: boolean) => void;
    allowMoreInfoVisible: boolean;
}

export default ({ device, doSelectDevice, allowMoreInfoVisible }: Props) => {
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
            onClick={() => doSelectDevice(device, false)}
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
