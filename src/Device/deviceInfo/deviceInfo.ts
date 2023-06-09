/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/*
   eslint-disable import/no-webpack-loader-syntax,import/no-unresolved --

   It would be nice to process all SVGs with svgr, which would make the two
   disables above unnecessary, but that would be a breaking change for all
   apps that rely on the current configuration, which uses the file loader
   to load SVGs.

   The difference between the file loader and using svgr:

   - With the file loaded an URL is returned which then can be used (e.g. in an img tag) like this:

       import chipIconUrl from './chipIconUrl.svg';
       const Icon = () => <img src={chipIconUrl} />

   - With svgr a react component is returned, which then can be rendered like this:

       import ChipIcon from '!!@svgr!./chipIconUrl.svg';
       const Icon = () => <ChipIcon />

   One of the advantages of svgr is, that it includes the SVG inline, so it can be styled
   through CSS, e.g. to change the colours.
*/

import logger from '../../logging';
import { Device } from '../deviceSlice';

import nrf51logo from '!!@svgr!./nRF51-Series-logo.svg';
import nrf52logo from '!!@svgr!./nRF52-Series-logo.svg';
import nrf53logo from '!!@svgr!./nRF53-Series-logo.svg';
import nrf7002logo from '!!@svgr!./nRF70-Series_no-background_RGB.svg';
import nrf91logo from '!!@svgr!./nRF91-Series-logo.svg';
import ppkLogo from '!!@svgr!./ppk-logo.svg';
import unknownLogo from '!!@svgr!./unknown-logo.svg';
import unknownNordicLogo from '!!@svgr!./unknown-nordic-logo.svg';

type DevicePCA =
    | 'PCA10028'
    | 'PCA10031'
    | 'PCA10040'
    | 'PCA10056'
    | 'PCA10059'
    | 'PCA10090'
    | 'PCA10095'
    | 'PCA10100'
    | 'PCA10121'
    | 'PCA20020'
    | 'PCA20035'
    | 'PCA10143';

interface DeviceInfo {
    name?: string | null;
    cores?: number;
    icon: React.ElementType;
    website: {
        productPagePath?: string;
        buyOnlineParams?: string;
    };
}

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
    PCA10095: {
        name: 'nRF5340 DK',
        cores: 2,
        icon: nrf53logo,
        website: {
            productPagePath: 'Software-and-tools/Development-Kits/nRF5340-DK',
            buyOnlineParams: 'search_token=nRF5340-DK&series_token=nRF5340',
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
    PCA10121: {
        name: 'nRF5340 Audio DK',
        cores: 2,
        icon: nrf53logo,
        website: {
            productPagePath: 'Products/Development-hardware/nRF5340-Audio-DK',
            buyOnlineParams:
                'search_token=nRF5340-Audio-DK&series_token=nRF5340',
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
    PCA10143: {
        name: 'nRF7002 DK',
        cores: 2,
        icon: nrf7002logo,
        website: {
            productPagePath: 'Products/Development-hardware/nRF7002-DK',
            buyOnlineParams: 'search_token=nRF7002-DK&series_token=nRF7002',
        },
    },
};

const deviceByPca = (device: Device) =>
    devicesByPca[String(device.boardVersion).toUpperCase() as DevicePCA];

const NORDIC_VENDOR_ID = '1915';
const isNordicDevice = (device: Device) =>
    device.serialport?.vendorId === NORDIC_VENDOR_ID;

const ppkDeviceInfo = (device: Device): DeviceInfo => ({
    name: device.usb?.product,
    icon: ppkLogo,
    website: {
        productPagePath:
            'Software-and-tools/Development-Tools/Power-Profiler-Kit-2',
        buyOnlineParams: 'search_token=nRF-PPK2',
    },
});

const deviceByUsb = (device: Device) => {
    if (isNordicDevice(device)) {
        if (device.usb?.product?.startsWith('PPK')) {
            return ppkDeviceInfo(device);
        }
        if (device.serialNumber?.startsWith('THINGY91')) {
            return devicesByPca.PCA20035;
        }
    }
    return null;
};

let hasShownUdevWarning = false;
const unknownDevice = (device: Device): DeviceInfo => {
    if (
        isNordicDevice(device) &&
        process.platform === 'linux' &&
        !hasShownUdevWarning
    ) {
        logger.warn(
            'Could not properly detect an unknown device. Please make sure you have nrf-udev installed: https://github.com/NordicSemiconductor/nrf-udev'
        );
        hasShownUdevWarning = true;
    }

    return {
        name: device.usb?.product,
        icon: isNordicDevice(device) ? unknownNordicLogo : unknownLogo,
        website: {},
    };
};

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

export const productPageUrl = (device: Device) =>
    deviceInfo(device).website.productPagePath &&
    `https://www.nordicsemi.com/${deviceInfo(device).website.productPagePath}`;

export const buyOnlineUrl = (device: Device) =>
    deviceInfo(device).website.buyOnlineParams &&
    `https://www.nordicsemi.com/About-us/BuyOnline?${
        deviceInfo(device).website.buyOnlineParams
    }`;
