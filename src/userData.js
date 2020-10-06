/* Copyright (c) 2105 - 2020, Nordic Semiconductor ASA
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

const trackId = 'UA-22498474-5';
/**
 * Initialize instance to send user data
 * @param {*} appName the app's name e.g. Launcher
 *
 * @returns {void}
 */
const init = async appName => {
    const networkInterfaces = await si.networkInterfaces();
    let networkInterface = networkInterfaces.find(i => i.iface === 'eth0');
    networkInterface =
        networkInterface || networkInterfaces.find(i => i.iface === 'Ethernet');
    networkInterface =
        networkInterface || networkInterfaces.find(i => i.mac && !i.internal);
    const clientId = networkInterface
        ? shasum(
              networkInterface.ip4 ||
                  networkInterface.ip6 + networkInterface.mac
          )
        : 'unknown';
    reactGA.initialize(trackId, {
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
        // According to Nordic Personal Data Processing Protocol for nRF Connect for Desktop
        // https://projecttools.nordicsemi.no/confluence/display/ISMS/nRF+Connect+for+Desktop
        // we set ip as anonymized in Google Analytics as described on page
        // https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#anonymizeIp
        anonymizeIp: true,
    });

    reactGA.pageview(appName);
};

/**
 * Send event
 * @param {string} category launcher or apps
 * @param {string} action action to collect
 * @param {string} label details for an action
 *
 * @returns {void}
 */
const sendEvent = (category, action, label) =>
    reactGA.event({
        category,
        action,
        label,
    });

export default {
    init,
    sendEvent,
};
