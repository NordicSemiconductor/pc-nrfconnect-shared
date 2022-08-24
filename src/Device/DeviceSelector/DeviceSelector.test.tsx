/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    fireEvent,
    screen,
    waitFor,
    waitForElementToBeRemoved,
} from '@testing-library/react';

import render from '../../../test/testrenderer';
import { Device } from '../../state';
import { devicesDetected } from '../deviceSlice';
import DeviceSelector from './DeviceSelector';

jest.mock('../sdfuOperations', () => ({}));

const testDevice: Device = {
    id: 1,
    hwInfo: {
        romSize: 123,
        ramSize: 456,
        romPageSize: 789,
        deviceFamily: 'PCATest',
        deviceVersion: 'PCATest',
    },
    broken: null,
    usb: {
        serialNumber: '000000001',
        manufacturer: 'testManufacturer',
        product: 'testProduct',
        device: {
            busNumber: 2,
            address: 3,
            descriptor: {
                bDescriptorType: 4,
                idVendor: 5,
                idProduct: 6,
            },
            configurations: [],
        },
    },
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
        boardVersion: null,
        pnpId: null,
        locationId: null,
        vcom: null,
    },
    favorite: false,
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
        render(
            <DeviceSelector
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuBoot: true,
                }}
            />
        );
        expect(screen.getByText('Select device')).toBeInTheDocument();
    });

    it('should show no connected devices', () => {
        render(
            <DeviceSelector
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuBoot: true,
                }}
            />
        );
        fireEvent.click(screen.getByText('Select device'));
        expect(screen.getByText('Nordic development kit')).toBeInTheDocument();
    });

    it('should list connected devices', () => {
        render(
            <DeviceSelector
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuBoot: true,
                }}
            />,
            [devicesDetected([testDevice])]
        );
        expect(screen.getByText(testDevice.serialNumber)).toBeInTheDocument();
    });

    it('should unlist disconnected devices', () => {
        render(
            <DeviceSelector
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuBoot: true,
                }}
            />,
            [devicesDetected([testDevice]), devicesDetected([])]
        );
        expect(screen.queryByText(testDevice.serialNumber)).toBeNull();
    });

    it('should show more device info when selecting the expand button', () => {
        render(
            <DeviceSelector
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuBoot: true,
                }}
            />,
            [devicesDetected([testDevice])]
        );
        fireEvent.click(screen.getByText('Select device'));
        fireEvent.click(screen.getByTestId('show-more-device-info'));
        expect(screen.getAllByText(/COM/)).toHaveLength(2);
    });

    it('can select connected devices', () => {
        render(
            <DeviceSelector
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuBoot: true,
                }}
            />,
            [devicesDetected([testDevice])]
        );

        fireEvent.click(screen.getByText('Select device'));
        fireEvent.click(screen.getByText(testDevice.serialNumber));
        expect(screen.getAllByText(testDevice.serialNumber)).toHaveLength(2);
    });

    it('can deselect selected devices', async () => {
        render(
            <DeviceSelector
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuBoot: true,
                }}
            />,
            [devicesDetected([testDevice])]
        );
        fireEvent.click(screen.getByText('Select device'));
        fireEvent.click(screen.getByText(testDevice.serialNumber));
        await screen.findByTestId('disconnect-device');
        fireEvent.click(screen.getByTestId('disconnect-device'));
        expect(screen.getAllByText(testDevice.serialNumber)).toHaveLength(1);
        expect(screen.getByText('Select device')).toBeInTheDocument();
    });

    it('should allow device selection when custom devices are enabled and no valid firmware is defined', () => {
        render(
            <DeviceSelector
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuBoot: true,
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
        fireEvent.click(screen.getByText('Select device'));
        fireEvent.click(screen.getByText(testDevice.serialNumber));

        expect(screen.queryByText('OK')).toBeNull();
        expect(screen.getAllByText(testDevice.serialNumber)).toHaveLength(2);
    });

    it('should deselect device when custom devices are disabled and no valid firmware is defined', async () => {
        render(
            <DeviceSelector
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuBoot: true,
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

        fireEvent.click(screen.getByText('Select device'));
        fireEvent.click(screen.getByText(testDevice.serialNumber));

        expect(screen.queryByText('OK')).toBeNull();
        await waitFor(() => {
            expect(screen.getAllByText(testDevice.serialNumber)).toHaveLength(
                1
            );
        });
        await screen.findByText('Select device');
    });

    it('should show firmware prompt when a valid firmware is defined', async () => {
        render(
            <DeviceSelector
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuBoot: true,
                }}
                deviceSetup={validFirmware}
            />,
            [devicesDetected([testDevice])]
        );

        fireEvent.click(screen.getByText('Select device'));
        fireEvent.click(screen.getByText(testDevice.serialNumber));

        await screen.findByText(
            'Device must be programmed, do you want to proceed?'
        );
    });

    it('should select device when cancelling firmware prompt', async () => {
        render(
            <DeviceSelector
                deviceListing={{
                    nordicUsb: true,
                    serialPort: true,
                    jlink: true,
                    mcuBoot: true,
                }}
                deviceSetup={validFirmware}
            />,
            [devicesDetected([testDevice])]
        );

        fireEvent.click(screen.getByText('Select device'));
        fireEvent.click(screen.getByText(testDevice.serialNumber));
        await screen.findByText('No');
        fireEvent.click(screen.getByText('No'));

        await waitForElementToBeRemoved(() =>
            screen.queryByText(
                'Device must be programmed, do you want to proceed?'
            )
        );
        expect(screen.getAllByText(testDevice.serialNumber)).toHaveLength(2);
    });
});
