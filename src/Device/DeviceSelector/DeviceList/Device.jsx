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

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    arrayOf, bool, func, shape, string,
} from 'prop-types';
import { serialports, deviceName } from '../../deviceInfo/deviceInfo';
import PseudoButton from '../../../PseudoButton/PseudoButton';
import deviceShape from '../deviceShape';
import BasicDeviceInfo from '../BasicDeviceInfo';
import ChangeName from './ChangeName';
import './device.scss';
import { setFavoriteDevice } from '../../../persistentStore';
import { deviceFavorited, deviceNickname } from '../../deviceActions';

const Serialports = ({ ports }) => (
    <ul className="ports">
        {ports.map(port => <li key={port.path}>{port.path}</li>)}
    </ul>
);
Serialports.propTypes = {
    ports: arrayOf(
        shape({
            path: string.isRequired,
        }).isRequired,
    ).isRequired,
};

const MoreDeviceInfo = ({
    device, name, onchange, setFav,
}) => {
    const [visible, setVisible] = useState(false);
    const { favorite, nickname } = device;
    return (
        <>
            {(nickname !== '' || null)
                ? (
                    <div key="withoutNickname">
                        {deviceName(device) || device.boardVersion || 'Unknown'}
                        <Serialports ports={serialports(device)} />
                    </div>
                )
                : (
                    <div key="withNickname">
                        <Serialports ports={serialports(device)} />
                    </div>
                )}
            <div key="btn-group" className="btn-group">
                <PseudoButton
                    className="favBtn"
                    onClick={setFav}
                >
                    {favorite
                        ? (
                            <div className="mdi mdi-star-off star">{ '\xa0\xa0' } UN-FAVORITE</div>
                        )
                        : (
                            <div className="mdi mdi-star star">{ '\xa0\xa0' } FAVORITE</div>
                        )}
                </PseudoButton>
                <PseudoButton className="inputBtn" id="inputBtn" onClick={() => setVisible(!visible)}>
                    <div className="mdi mdi-pencil-circle" style={{ marginTop: 9 }}>{ '\xa0' } RENAME DEVICE</div>
                </PseudoButton>
                <PseudoButton onClick={() => setVisible(visible)}>
                    <ChangeName data={name} onchange={e => { onchange(e); }} visible={visible} />
                </PseudoButton>
            </div>
        </>
    );
};

MoreDeviceInfo.propTypes = {
    device: deviceShape.isRequired,
    name: string,
    onchange: func.isRequired,
    setFav: func.isRequired,
};
MoreDeviceInfo.defaultProps = {
    name: null,
};

const additionalClassName = (moreVisible, isSelected) => {
    if (moreVisible) return 'more-infos-visible';
    if (isSelected) return 'selected-device';
    return '';
};

const Device = ({ device, isSelected, doSelectDevice }) => {
    const dispatch = useDispatch();
    const [moreVisible, setMoreVisible] = useState(false);
    const { favorite, serialNumber, nickname } = device;

    const onchange = data => {
        dispatch(deviceNickname(serialNumber, data));
    };

    const showMoreInfos = (
        <PseudoButton
            className={`show-more mdi mdi-chevron-${moreVisible ? 'up' : 'down'}`}
            onClick={() => setMoreVisible(!moreVisible)}
        />
    );

    const setFav = () => {
        setFavoriteDevice(serialNumber, !favorite);
        dispatch(deviceFavorited(serialNumber, !favorite));
    };

    return (
        <PseudoButton
            className={`device ${additionalClassName(moreVisible, isSelected)}`}
            onClick={() => doSelectDevice(device)}
        >
            <BasicDeviceInfo
                nickname={nickname}
                device={device}
                whiteBackground={false}
                rightElement={showMoreInfos}
                setFav={setFav}
            />
            <div className="more-infos">
                {moreVisible && (
                    <MoreDeviceInfo
                        device={device}
                        data={nickname}
                        onchange={onchange}
                        setFav={setFav}
                    />
                )}
            </div>
        </PseudoButton>
    );
};
Device.propTypes = {
    device: deviceShape.isRequired,
    isSelected: bool.isRequired,
    doSelectDevice: func.isRequired,
};

export default Device;
