/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { OFFICIAL } from '../../../ipc/sources';
import packageJsonFromShared from '../../../package.json';
import render from '../../../test/testrenderer';
import { addDevice, Device, removeDevice } from '../deviceSlice';
import { jprogDeviceSetup } from '../jprogOperations';
import DeviceSelector from './DeviceSelector';

jest.mock('../../../nrfutil/device/device');

jest.mock('../../utils/packageJson', () => ({
    isLauncher: () => false,
    packageJson: () => packageJsonFromShared,
}));

const appDetails = Promise.resolve({ source: OFFICIAL });
jest.mock('../../utils/appDetails', () => ({
    __esModule: true,
    default: () => appDetails,
}));

const DEVICE_SERIAL_NUMBER = '000000001';

const testDevice: Device = {
    id: 1,
    broken: null,
    usb: {
        serialNumber: DEVICE_SERIAL_NUMBER,
        manufacturer: 'testManufacturer',
        product: 'testProduct',
        osDevicePath: '/some-path',
        device: {
            busNumber: 2,
            address: 3,
            descriptor: {
                bcdDevice: 0,
                bDescriptorType: 4,
                idVendor: 5,
                idProduct: 6,
            },
            configList: {
                descriptors: [],
                interfaceLists: [],
                length: 0,
            },
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
            vcom: 1,
        },
        {
            path: 'COM2',
            manufacturer: 'testManufacturer',
            productId: 'testProduct',
            serialNumber: '000000001',
            vendorId: 'testVendor',
            comName: 'COM2',
            vcom: 2,
        },
    ],
    favorite: false,
    traits: {
        jlink: true,
    },
    devkit: {
        boardVersion: 'PCATest',
        deviceFamily: 'PCATest',
    },
};

const deviceSetupMock: ReturnType<typeof jprogDeviceSetup> = {
    supportsProgrammingMode: jest.fn(() => true),
    getFirmwareOptions: jest.fn(() => [
        { key: 'PCATest', programDevice: jest.fn() },
    ]),
    isExpectedFirmware: jest.fn(
        (device: Device) => () =>
            Promise.resolve({
                device,
                validFirmware: false,
            })
    ),
    tryToSwitchToApplicationMode: jest.fn(() => () => Promise.resolve(null)),
};

const validFirmware = {
    deviceSetups: [deviceSetupMock],
    allowCustomDevice: false,
};

describe('DeviceSelector', () => {
    it('should have no device selected by default', () => {
        render(
            <DeviceSelector
                deviceListing={{
                    nordicUsb: true,
                    serialPorts: true,
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
                    serialPorts: true,
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
                    serialPorts: true,
                    jlink: true,
                    mcuBoot: true,
                }}
            />,
            [addDevice(testDevice)]
        );
        expect(screen.getByText(DEVICE_SERIAL_NUMBER)).toBeInTheDocument();
    });

    it('should unlist disconnected devices', () => {
        render(
            <DeviceSelector
                deviceListing={{
                    nordicUsb: true,
                    serialPorts: true,
                    jlink: true,
                    mcuBoot: true,
                }}
            />,
            [addDevice(testDevice), removeDevice(testDevice)]
        );
        expect(screen.queryByText(DEVICE_SERIAL_NUMBER)).toBeNull();
    });

    it('should show more device info when selecting the expand button', () => {
        render(
            <DeviceSelector
                deviceListing={{
                    nordicUsb: true,
                    serialPorts: true,
                    jlink: true,
                    mcuBoot: true,
                }}
            />,
            [addDevice(testDevice)]
        );
        fireEvent.click(screen.getByText('Select device'));
        fireEvent.click(screen.getByTestId('show-more-device-info'));
        expect(screen.getAllByText(/COM/)).toHaveLength(2);
    });

    it('can select connected devices', async () => {
        render(
            <DeviceSelector
                deviceListing={{
                    nordicUsb: true,
                    serialPorts: true,
                    jlink: true,
                    mcuBoot: true,
                }}
            />,
            [addDevice(testDevice)]
        );

        fireEvent.click(screen.getByText('Select device'));
        // eslint-disable-next-line testing-library/no-unnecessary-act
        await act(async () => {
            await fireEvent.click(screen.getByText(DEVICE_SERIAL_NUMBER));
        });

        expect(screen.getAllByText(DEVICE_SERIAL_NUMBER)).toHaveLength(2);
    });

    it('can deselect selected devices', async () => {
        render(
            <DeviceSelector
                deviceListing={{
                    nordicUsb: true,
                    serialPorts: true,
                    jlink: true,
                    mcuBoot: true,
                }}
            />,
            [addDevice(testDevice)]
        );
        fireEvent.click(screen.getByText('Select device'));
        fireEvent.click(screen.getByText(DEVICE_SERIAL_NUMBER));
        await screen.findByTestId('disconnect-device');
        fireEvent.click(screen.getByTestId('disconnect-device'));
        expect(screen.getAllByText(DEVICE_SERIAL_NUMBER)).toHaveLength(1);
        expect(screen.getByText('Select device')).toBeInTheDocument();
    });

    it('should allow device selection when custom devices are enabled and no valid firmware is defined', async () => {
        render(
            <DeviceSelector
                deviceListing={{
                    nordicUsb: true,
                    serialPorts: true,
                    jlink: true,
                    mcuBoot: true,
                }}
                deviceSetupConfig={{
                    deviceSetups: [
                        jprogDeviceSetup([
                            {
                                key: 'firmware_1',
                                fw: 'firmware/invalidDevice.hex',
                                fwVersion: 'fw-1.0.0',
                                fwIdAddress: 0x6000,
                            },
                        ]),
                    ],
                    allowCustomDevice: true,
                }}
            />,
            [addDevice(testDevice)]
        );
        fireEvent.click(screen.getByText('Select device'));

        // eslint-disable-next-line testing-library/no-unnecessary-act
        await act(async () => {
            await fireEvent.click(screen.getByText(DEVICE_SERIAL_NUMBER));
        });

        expect(screen.queryByText('OK')).toBeNull();
        expect(screen.getAllByText(DEVICE_SERIAL_NUMBER)).toHaveLength(2);
    });

    it('should deselect device when custom devices are disabled and no valid firmware is defined', async () => {
        render(
            <DeviceSelector
                deviceListing={{
                    nordicUsb: true,
                    serialPorts: true,
                    jlink: true,
                    mcuBoot: true,
                }}
                deviceSetupConfig={{
                    deviceSetups: [
                        jprogDeviceSetup([
                            {
                                key: 'invalidDevice',
                                fw: 'firmware/invalidDevice.hex',
                                fwVersion: 'fw-1.0.0',
                                fwIdAddress: 0x6000,
                            },
                        ]),
                    ],
                    allowCustomDevice: false,
                }}
            />,
            [addDevice(testDevice)]
        );

        fireEvent.click(screen.getByText('Select device'));
        fireEvent.click(screen.getByText(DEVICE_SERIAL_NUMBER));

        expect(screen.queryByText('OK')).toBeNull();
        await waitFor(() => {
            expect(screen.getAllByText(DEVICE_SERIAL_NUMBER)).toHaveLength(1);
        });
        await screen.findByText('Select device');
    });

    it('should show firmware prompt when a valid firmware is defined', async () => {
        render(
            <DeviceSelector
                deviceListing={{
                    nordicUsb: true,
                    serialPorts: true,
                    jlink: true,
                    mcuBoot: true,
                }}
                deviceSetupConfig={validFirmware}
            />,
            [addDevice(testDevice)]
        );

        fireEvent.click(screen.getByText('Select device'));
        fireEvent.click(screen.getByText(DEVICE_SERIAL_NUMBER));

        await screen.findByText(
            'Device must be programmed. Do you want to proceed?'
        );
    });

    it('should select device when cancelling firmware prompt', async () => {
        render(
            <DeviceSelector
                deviceListing={{
                    nordicUsb: true,
                    serialPorts: true,
                    jlink: true,
                    mcuBoot: true,
                }}
                deviceSetupConfig={validFirmware}
            />,
            [addDevice(testDevice)]
        );

        fireEvent.click(screen.getByText('Select device'));
        fireEvent.click(screen.getByText(DEVICE_SERIAL_NUMBER));

        await screen.findByText(
            'Device must be programmed. Do you want to proceed?'
        );

        fireEvent.click(screen.getByText('No'));

        expect(
            screen.queryByText(
                'Device must be programmed. Do you want to proceed?'
            )
        ).toBeNull();

        expect(screen.getAllByText(DEVICE_SERIAL_NUMBER)).toHaveLength(2);
    });
});
