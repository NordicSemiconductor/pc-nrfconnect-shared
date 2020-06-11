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
import {
    arrayOf, bool, func, shape, string,
} from 'prop-types';
import { serialports, deviceName } from '../../deviceInfo/deviceInfo';
import PseudoButton from '../../../PseudoButton/PseudoButton';
import deviceShape from '../deviceShape';
import BasicDeviceInfo from '../BasicDeviceInfo';
import ChangeName from './ChangeName';

import './device.scss';

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

const MoreDeviceInfo = ({ device, name, onchange }) => (
    // console.log(BasicDeviceInfo.nickname.value)
    // hvis den har nickname ikke bare om feltet er tomt, sjekke mot lagring av nickname?
    (BasicDeviceInfo.nickname != null)
        ? (
            // console.log('ikke tomt'),
            <div>
                <br />
                {deviceName(device) || device.boardVersion || 'Unknown'}
                <Serialports ports={serialports(device)} />
                <ChangeName data={name} onchange={e => { onchange(e); }} />
            </div>
        )
        : (
            // console.log('tomt'),
            <div>
                <Serialports ports={serialports(device)} />
                <ChangeName data={name} onchange={e => { onchange(e); }} />
            </div>
        )
    // <div><ChangeName data={name} onchange={e => { onchange(e); }} /></div>
);
MoreDeviceInfo.propTypes = {
    device: deviceShape.isRequired,
    name: string,
    onchange: func.isRequired,
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
    const [moreVisible, setMoreVisible] = useState(false);
    const [name, setName] = useState();

    const onchange = data => {
        setName(data);
        console.log('Form>', data);
    };

    const showMoreInfos = (
        <PseudoButton
            className={`show-more mdi mdi-chevron-${moreVisible ? 'up' : 'down'}`}
            onClick={() => setMoreVisible(!moreVisible)}
        />
    );

    return (
        <div>
            <PseudoButton
                className={`device ${additionalClassName(moreVisible, isSelected)}`}
                onClick={() => doSelectDevice(device)}
            >
                <BasicDeviceInfo
                    nickname={name}
                    device={device}
                    whiteBackground={false}
                    rightElement={showMoreInfos}
                />
                <div className="more-infos">
                    {moreVisible
                        /* && (nickname != null)
                            ? (
                                <div>{deviceName(device) || device.boardVersion || 'Unknown'}</div>
                            ) */
                        && (
                            <MoreDeviceInfo
                                device={device}
                                data={name}
                                onchange={e => { onchange(e); }}
                            />
                        )}
                </div>
            </PseudoButton>
        </div>
    );
};
Device.propTypes = {
    device: deviceShape.isRequired,
    isSelected: bool.isRequired,
    doSelectDevice: func.isRequired,
};

export default Device;
