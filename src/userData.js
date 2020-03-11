/* Copyright (c) 2105 - 2019, Nordic Semiconductor ASA
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

import reactGA from 'react-ga';
import si from 'systeminformation';
import shasum from 'shasum';

const EventCategory = {
    APP_LAUNCH_CATEGORY: 'Launcher',
    PROGRAMMER_CATEGORY: 'Programmer',
};

const EventAction = {
    // APP_LAUNCH_CATEGORY
    LAUNCH_LAUNCHER_ACTION: 'Launch launcher',
    LAUNCH_BLE_ACTION: 'Launch BLE',
    LAUNCH_PROGRAMMER_ACTION: 'Launch Programmer',
    LAUNCH_DTM_ACTION: 'Launch DTM',
};

const EventLabel = {
    // LAUNCH_LAUNCHER_ACTION
    LAUNCHER_USER_DATA_ON: 'User data on',
    LAUNCHER_USER_DATA_OFF: 'User data off',
};


/**
 * Initialize instance to send user data
 * @param {*} appName
 */
const init = async appName => {
    const networkInterfaces = await si.networkInterfaces();
    const networkInterface = networkInterfaces.find(i =>
        ((!i.virtual && i.mac) || i.iface === 'eth0'));
    const clientId = networkInterface
        ? shasum(networkInterface.ip4 + networkInterface.mac)
        : 'unknown';
    reactGA.initialize('UA-64174722-5', {
        debug: false,
        titleCase: false,
        gaOptions: {
            storage: 'none',
            storeGac: false,
            clientId,
        },
    });

    reactGA.set({
        checkProtocolTask: null,
    });

    reactGA.pageview(appName);
};

/**
 * Send event
 * @param {EventCategory} category
 * @param {EventAction} action
 * @param {EventLabel} label
 */
const sendEvent = (category, action, label) => reactGA.event({
    category,
    action,
    label,
});



export default {
    init,
    sendEvent,
    EventCategory,
    EventAction,
    EventLabel,
}
