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

const ShowMoreInfo = ({
    isVisible,
    toggleVisible,
}: {
    isVisible: boolean;
    toggleVisible: () => void;
}) => (
    <PseudoButton
        className={classNames(
            isVisible ? 'tw-visible' : 'tw-invisible group-hover:tw-visible',
            `mdi mdi-chevron-${isVisible ? 'up' : 'down'}`,
        )}
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
                'tw-flex tw-flex-col tw-gap-2 tw-py-3 tw-font-light group-hover:tw-bg-white',
                moreVisible && 'tw-bg-white',
                moreVisible && device.serialNumber && 'tw-pb-0',
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
