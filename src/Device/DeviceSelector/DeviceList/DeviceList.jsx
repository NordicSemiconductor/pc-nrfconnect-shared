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

import React from 'react';
import { arrayOf, func } from 'prop-types';
import { useSelector } from 'react-redux';
import { selectedSerialNumber as selectedSerialNumberSelector } from '../../deviceReducer';
import Device from './Device';
import deviceShape from '../deviceShape';

import './device-list.scss';
import { getIsFavoriteDevice } from '../../../persistentStore';
// import { getIsFavoriteDevice } from '../../../persistentStore';

const NoDevicesConnected = () => (
    <p className="no-devices-connected">
        Connect a{' '}
        <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.nordicsemi.com/Software-and-tools/Development-Kits"
        >
            Nordic development kit
        </a>
        {' '}to your computer.
    </p>
);

const DeviceList = ({ devices, doSelectDevice }) => {
    const selectedSerialNumber = useSelector(selectedSerialNumberSelector);

    if (devices.length === 0) return <NoDevicesConnected />;

    // Trying to sort the devices so that favorited items always are on top,
    // but this fails in some cases with 3 or more kits attatched
    // it also wont get past lint due to "Do not nest ternary expressions"
    /* devices.sort((x, y) => (
        (getIsFavoriteDevice(String(x.serialNumber)) === getIsFavoriteDevice(String(y.serialNumber))
        ) ? 0 : x ? -1 : 1)); */
    const sorted = devices.sort((a, b) => (getIsFavoriteDevice(String(b.serialNumber))
    - getIsFavoriteDevice(String(a.serialNumber))));

    return (
        <ul className="device-list">
            {sorted.map(device => (
                <li key={device.serialNumber}>
                    <Device
                        device={device}
                        isSelected={selectedSerialNumber === device.serialNumber}
                        doSelectDevice={doSelectDevice}
                    />
                </li>
            ))}
        </ul>
    );
};
DeviceList.propTypes = {
    devices: arrayOf(deviceShape.isRequired).isRequired,
    doSelectDevice: func.isRequired,
};

export default DeviceList;
