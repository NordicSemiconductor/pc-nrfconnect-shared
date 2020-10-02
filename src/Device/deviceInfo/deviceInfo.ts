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

/*
   eslint-disable import/no-webpack-loader-syntax,import/no-unresolved --

   It would be nice to add @svgr/webpack to the webpack configuration, which would make the two
   disables above unnecessary, but that would be a breaking change for all apps that rely
   on the current configuration, which uses url-loader to load SVGs.

   The difference between url-loader and @svgr/webpack:

   - With url-loader an URL is returned which then can be used (e.g. in an img tag) like this:

       import chipIconUrl from './chipIconUrl.svg';
       const Icon = () => <img src={chipIconUrl} />

   - With @svgr/webpack a react component is returned, which then can be rendered like this:

       import ChipIcon from '!!@svgr/webpack!./chipIconUrl.svg';
       const Icon = () => <ChipIcon />

   One of the advantages of @svgr/webpack is, that it includes the SVG inline, so it can be styled
   through CSS, e.g. to change the colours.
*/

import { Device, Serialport } from 'pc-nrfconnect-shared';

import nrf51logo from '!!@svgr/webpack!./nRF51-Series-logo.svg';
import nrf52logo from '!!@svgr/webpack!./nRF52-Series-logo.svg';
import nrf53logo from '!!@svgr/webpack!./nRF53-Series-logo.svg';
import nrf91logo from '!!@svgr/webpack!./nRF91-Series-logo.svg';
import unknownLogo from '!!@svgr/webpack!./unknown-logo.svg';
import unknownNordicLogo from '!!@svgr/webpack!./unknown-nordic-logo.svg';

interface DeviceInfo {
    name?: string;
    cores?: number;
    icon: React.Component;
    website: {
        productPagePath?: string;
        buyOnlineParams?: string;
    };
}

type DevicePCA =
    | 'PCA10028'
    | 'PCA10031'
    | 'PCA10040'
    | 'PCA10056'
    | 'PCA10059'
    | 'PCA10090'
    | 'PCA10100'
    | 'PCA10095'
    | 'PCA20020'
    | 'PCA20035';

const devicesByPca: { [P in DevicePCA]: DeviceInfo } = {
    PCA10028: {
        name: 'nRF51 DK',
        cores: 1,
        icon: nrf51logo,
        website: {
            productPagePath: 'Software-and-tools/Development-Kits/nRF51-DK',
            buyOnlineParams: 'search_token=nrf51-DK&series_token=nRF51822',
        },
    },
    PCA10031: {
        name: 'nRF51 Dongle',
        cores: 1,
        icon: nrf51logo,
        website: {
            productPagePath: 'Software-and-tools/Development-Kits/nRF51-Dongle',
            buyOnlineParams: 'search_token=nRF51-Dongle&series_token=nRF51822',
        },
    },
    PCA10040: {
        name: 'nRF52 DK',
        cores: 1,
        icon: nrf52logo,
        website: {
            productPagePath: 'Software-and-tools/Development-Kits/nRF52-DK',
            buyOnlineParams: 'search_token=nRF52-DK&series_token=nRF52832',
        },
    },
    PCA10056: {
        name: 'nRF52840 DK',
        cores: 1,
        icon: nrf52logo,
        website: {
            productPagePath: 'Software-and-tools/Development-Kits/nRF52840-DK',
            buyOnlineParams: 'search_token=nrf52840-DK&series_token=nRF52840',
        },
    },
    PCA10059: {
        name: 'nRF52840 Dongle',
        cores: 1,
        icon: nrf52logo,
        website: {
            productPagePath:
                'Software-and-tools/Development-Kits/nRF52840-Dongle',
            buyOnlineParams:
                'search_token=nRF52840DONGLE&series_token=nRF52840',
        },
    },
    PCA10090: {
        name: 'nRF9160 DK',
        cores: 1,
        icon: nrf91logo,
        website: {
            productPagePath: 'Software-and-tools/Development-Kits/nRF9160-DK',
            buyOnlineParams: 'search_token=nrf9160-DK&series_token=nRF9160',
        },
    },
    PCA10100: {
        name: 'nRF52833 DK',
        cores: 1,
        icon: nrf52logo,
        website: {
            productPagePath: 'Software-and-tools/Development-Kits/nRF52833-DK',
            buyOnlineParams: 'search_token=nRF52833-DK&series_token=nRF52833',
        },
    },
    PCA10095: {
        name: 'nRF5340 DK',
        cores: 2,
        icon: nrf53logo,
        website: {
            productPagePath: 'Software-and-tools/Development-Kits/nRF5340-PDK',
            buyOnlineParams: 'search_token=nRF5340-PDK&series_token=nRF5340',
        },
    },
    PCA20020: {
        name: 'Nordic Thingy:52',
        cores: 1,
        icon: nrf52logo,
        website: {
            productPagePath:
                'Software-and-tools/Prototyping-platforms/Nordic-Thingy-52',
            buyOnlineParams: 'search_token=nRF6936&series_token=nRF52832',
        },
    },
    PCA20035: {
        name: 'Nordic Thingy:91',
        cores: 1,
        icon: nrf91logo,
        website: {
            productPagePath:
                'Software-and-tools/Prototyping-platforms/Nordic-Thingy-91',
            buyOnlineParams: 'search_token=nRF6943&series_token=nRF9160',
        },
    },
};

const deviceByPca = (device: Device) =>
    devicesByPca[String(device.boardVersion).toUpperCase() as DevicePCA];

const NORDIC_VENDOR_ID = '1915';
const isNordicDevice = (device: Device) =>
    device.serialport?.vendorId === NORDIC_VENDOR_ID;

const usbDeviceInfo = (device: Device): DeviceInfo => ({
    name: device.usb?.product,
    icon: unknownNordicLogo, // FIXME Replace this with a correct icon when we have one
    website: {
        productPagePath: undefined, // FIXME Replace this when we have corrent link
        buyOnlineParams: undefined, // FIXME Replace this when we have corrent link
    },
});

const deviceByUsb = (device: Device) =>
    isNordicDevice(device) && device.usb?.product?.startsWith('KNOWN_USB_NAME')
        ? usbDeviceInfo(device)
        : null;

const unknownDevice = (device: Device): DeviceInfo => ({
    name: device.usb?.product,
    icon: isNordicDevice(device) ? unknownNordicLogo : unknownLogo,
    website: {},
});

export const deviceInfo = (device: Device): DeviceInfo =>
    deviceByPca(device) || deviceByUsb(device) || unknownDevice(device);

export const displayedDeviceName = (
    device: Device,
    { respectNickname = true } = {}
) => {
    if (respectNickname && device.nickname) {
        return device.nickname;
    }

    return deviceInfo(device).name || device.boardVersion || 'Unknown';
};

export const serialports = (device: Device) =>
    Object.entries(device)
        .filter(([key]) => key.startsWith('serialport'))
        .map(([, value]: [string, Serialport]) => value);

export const productPageUrl = (device: Device) =>
    deviceInfo(device).website.productPagePath &&
    `https://www.nordicsemi.com/${deviceInfo(device).website.productPagePath}`;

export const buyOnlineUrl = (device: Device) =>
    deviceInfo(device).website.buyOnlineParams &&
    `https://www.nordicsemi.com/About-us/BuyOnline?${
        deviceInfo(device).website.buyOnlineParams
    }`;
