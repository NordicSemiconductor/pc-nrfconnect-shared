/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import { DeviceSelector, logger } from '../src';

const deviceListing = {
    nordicUsb: true,
    serialport: true,
    jlink: true,
};

const mapState = () => ({
    deviceListing,
});

const mapDispatch = (/* dispatch */) => ({
    onDeviceSelected: device => {
        logger.info(`Selected device with s/n ${device.serialNumber}`);
    },
    onDeviceDeselected: () => {
        logger.info('Deselected device');
    },
});

export default connect(mapState, mapDispatch)(DeviceSelector);
