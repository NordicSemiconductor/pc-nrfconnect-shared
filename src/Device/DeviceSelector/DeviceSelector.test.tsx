/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    fireEvent,
    waitFor,
    waitForElementToBeRemoved,
} from '@testing-library/react';

import render from '../../../test/testrenderer';
import { Device } from '../../state';
import { devicesDetected } from '../deviceSlice';
import DeviceSelector from './DeviceSelector';

jest.mock('../sdfuOperations', () => ({}));

const testDevice: Device = {
    serialNumber: '000000001',
    serialPorts: [
        {
            path: 'COM1',
            manufacturer: 'testManufacturer',
            productId: 'testProduct',
            serialNumber: '000000001',
            vendorId: 'testVendor',
            comName: 'COM1',
            boardVersion: 'testBoardVersion',
            pnpId: 'testPnpId',
            locationId: 'testLocationId',
            vcom: 1,
        },
        {
            path: 'COM2',
            manufacturer: 'testManufacturer',
            productId: 'testProduct',
            serialNumber: '000000001',
            vendorId: 'testVendor',
            comName: 'COM2',
            boardVersion: 'testBoardVersion',
            pnpId: 'testPnpId',
            locationId: 'testLocationId',
            vcom: 2,
        },
    ],
    boardVersion: 'PCATest',
    serialport: {
        path: 'COM1',
        manufacturer: 'testManufacturer',
        productId: 'testProduct',
        serialNumber: '000000001',
        vendorId: 'testVendor',
        comName: 'COM1',
    },
    favorite: false,
    // @ts-expect-error The DeviceTraits type was wrong, but will be fixed by https://github.com/NordicPlayground/nrf-device-lib-js/pull/104
    traits: {
        jlink: true,
    },
    jlink: {
        boardVersion: 'PCATest',
        serialNumber: 'PCATest',
        jlinkObFirmwareVersion: 'PCATest',
        deviceFamily: 'PCATest',
        deviceVersion: 'PCATest',
    },
};

const validFirmware = {
    jprog: {
        PCATest: {
            fw: 'firmware/PCATest.hex',
            fwVersion: 'test-fw-1.0.0',
            fwIdAddress: 0x6000,
        },
    },
};

describe('DeviceSelector', () => {
    it('should have no device selected by default', () => {
        const { getByText } = render(
            <DeviceSelector
                // @ts-expect-error The DeviceTraits type was wrong, but will be fixed by https://github.com/NordicPlayground/nrf-device-lib-js/pull/104
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuboot: true,
                }}
            />
        );
        expect(getByText('Select device')).toBeInTheDocument();
    });

    it('should show no connected devices', () => {
        const { getByText } = render(
            <DeviceSelector
                // @ts-expect-error The DeviceTraits type was wrong, but will be fixed by https://github.com/NordicPlayground/nrf-device-lib-js/pull/104
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuboot: true,
                }}
            />
        );
        fireEvent.click(getByText('Select device'));
        expect(getByText('Nordic development kit')).toBeInTheDocument();
    });

    it('should list connected devices', () => {
        const { getByText } = render(
            <DeviceSelector
                // @ts-expect-error The DeviceTraits type was wrong, but will be fixed by https://github.com/NordicPlayground/nrf-device-lib-js/pull/104
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuboot: true,
                }}
            />,
            [devicesDetected([testDevice])]
        );
        expect(getByText(testDevice.serialNumber)).toBeInTheDocument();
    });

    it('should unlist disconnected devices', () => {
        const { queryByText } = render(
            <DeviceSelector
                // @ts-expect-error The DeviceTraits type was wrong, but will be fixed by https://github.com/NordicPlayground/nrf-device-lib-js/pull/104
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuboot: true,
                }}
            />,
            [devicesDetected([testDevice]), devicesDetected([])]
        );
        expect(queryByText(testDevice.serialNumber)).toBeNull();
    });

    it('should show more device info when selecting the expand button', () => {
        const { getByText, getByTestId, getAllByText } = render(
            <DeviceSelector
                // @ts-expect-error The DeviceTraits type was wrong, but will be fixed by https://github.com/NordicPlayground/nrf-device-lib-js/pull/104
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuboot: true,
                }}
            />,
            [devicesDetected([testDevice])]
        );
        fireEvent.click(getByText('Select device'));
        fireEvent.click(getByTestId('show-more-device-info'));
        expect(getAllByText(/COM/)).toHaveLength(2);
    });

    it('can select connected devices', () => {
        const { getAllByText, getByText } = render(
            <DeviceSelector
                // @ts-expect-error The DeviceTraits type was wrong, but will be fixed by https://github.com/NordicPlayground/nrf-device-lib-js/pull/104
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuboot: true,
                }}
            />,
            [devicesDetected([testDevice])]
        );

        fireEvent.click(getByText('Select device'));
        fireEvent.click(getByText(testDevice.serialNumber));
        expect(getAllByText(testDevice.serialNumber)).toHaveLength(2);
    });

    it('can deselect selected devices', async () => {
        const { getAllByText, getByText, findByTestId, getByTestId } = render(
            <DeviceSelector
                // @ts-expect-error The DeviceTraits type was wrong, but will be fixed by https://github.com/NordicPlayground/nrf-device-lib-js/pull/104
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuboot: true,
                }}
            />,
            [devicesDetected([testDevice])]
        );
        fireEvent.click(getByText('Select device'));
        fireEvent.click(getByText(testDevice.serialNumber));
        await findByTestId('disconnect-device');
        fireEvent.click(getByTestId('disconnect-device'));
        expect(getAllByText(testDevice.serialNumber)).toHaveLength(1);
        expect(getByText('Select device')).toBeInTheDocument();
    });

    it('should allow device selection when custom devices are enabled and no valid firmware is defined', () => {
        const { queryByText, getAllByText, getByText } = render(
            <DeviceSelector
                // @ts-expect-error The DeviceTraits type was wrong, but will be fixed by https://github.com/NordicPlayground/nrf-device-lib-js/pull/104
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuboot: true,
                }}
                deviceSetup={{
                    jprog: {
                        invalidDevice: {
                            fw: 'firmware/invalidDevice.hex',
                            fwVersion: 'fw-1.0.0',
                            fwIdAddress: 0x6000,
                        },
                    },
                    allowCustomDevice: true,
                }}
            />,
            [devicesDetected([testDevice])]
        );
        fireEvent.click(getByText('Select device'));
        fireEvent.click(getByText(testDevice.serialNumber));

        expect(queryByText('OK')).toBeNull();
        expect(getAllByText(testDevice.serialNumber)).toHaveLength(2);
    });

    it('should deselect device when custom devices are disabled and no valid firmware is defined', async () => {
        const { getByText, getAllByText, queryByText } = render(
            <DeviceSelector
                // @ts-expect-error The DeviceTraits type was wrong, but will be fixed by https://github.com/NordicPlayground/nrf-device-lib-js/pull/104
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuboot: true,
                }}
                deviceSetup={{
                    jprog: {
                        invalidDevice: {
                            fw: 'firmware/invalidDevice.hex',
                            fwVersion: 'fw-1.0.0',
                            fwIdAddress: 0x6000,
                        },
                    },
                    allowCustomDevice: false,
                }}
            />,
            [devicesDetected([testDevice])]
        );

        fireEvent.click(getByText('Select device'));
        fireEvent.click(getByText(testDevice.serialNumber));

        expect(queryByText('OK')).toBeNull();
        await waitFor(() => {
            expect(getAllByText(testDevice.serialNumber)).toHaveLength(1);
        });
        await waitFor(() =>
            expect(getByText('Select device')).toBeInTheDocument()
        );
    });

    it('should show firmware prompt when a valid firmware is defined', async () => {
        const { getByText } = render(
            <DeviceSelector
                // @ts-expect-error The DeviceTraits type was wrong, but will be fixed by https://github.com/NordicPlayground/nrf-device-lib-js/pull/104
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuboot: true,
                }}
                deviceSetup={validFirmware}
            />,
            [devicesDetected([testDevice])]
        );

        fireEvent.click(getByText('Select device'));
        fireEvent.click(getByText(testDevice.serialNumber));

        await waitFor(() =>
            expect(
                getByText('Device must be programmed, do you want to proceed?')
            ).toBeInTheDocument()
        );
    });

    it('should select device when cancelling firmware prompt', async () => {
        const { getByText, getAllByText, findByText } = render(
            <DeviceSelector
                // @ts-expect-error The DeviceTraits type was wrong, but will be fixed by https://github.com/NordicPlayground/nrf-device-lib-js/pull/104
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuboot: true,
                }}
                deviceSetup={validFirmware}
            />,
            [devicesDetected([testDevice])]
        );

        fireEvent.click(getByText('Select device'));
        fireEvent.click(getByText(testDevice.serialNumber));
        await findByText('No');
        fireEvent.click(getByText('No'));

        await waitForElementToBeRemoved(() =>
            getByText('Device must be programmed, do you want to proceed?')
        );
        expect(getAllByText(testDevice.serialNumber)).toHaveLength(2);
    });
});
