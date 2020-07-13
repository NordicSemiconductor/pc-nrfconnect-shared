/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React, { useState, useRef } from 'react';
import { bool, func } from 'prop-types';
import { useSelector } from 'react-redux';

import PseudoButton from '../../../PseudoButton/PseudoButton';
import { selectedSerialNumber } from '../../deviceReducer';
import deviceShape from '../deviceShape';
import BasicDeviceInfo from '../BasicDeviceInfo';
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

const additionalClassName = (moreVisible, isSelected) => {
    if (moreVisible) return 'more-infos-visible';
    if (isSelected) return 'selected-device';
    return '';
};

const Device = ({ device, doSelectDevice }) => {
    const [moreVisible, setMoreVisible] = useState(false);
    const toggleMoreVisible = () => setMoreVisible(!moreVisible);

    const showMoreInfo = <ShowMoreInfo isVisible={moreVisible} toggleVisible={toggleMoreVisible} />;

    const isSelected = device.serialNumber === useSelector(selectedSerialNumber);

    const deviceNameInputRef = useRef();
    const startEditingDeviceName = () => {
        deviceNameInputRef.current.focus();
    };

    return (
        <PseudoButton
            className={`device ${additionalClassName(moreVisible, isSelected)}`}
            onClick={() => doSelectDevice(device)}
        >
            <BasicDeviceInfo
                deviceNameInputRef={deviceNameInputRef}
                device={device}
                whiteBackground={false}
                additionalToggle={showMoreInfo}
            />
            <div className="more-infos">
                {moreVisible && (
                    <MoreDeviceInfo
                        device={device}
                        startEditingDeviceName={startEditingDeviceName}
                    />
                )}
            </div>
        </PseudoButton>
    );
};
Device.propTypes = {
    device: deviceShape.isRequired,
    doSelectDevice: func.isRequired,
};

export default Device;
