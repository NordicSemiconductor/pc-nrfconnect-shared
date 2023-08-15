import { list } from './device';
import {NrfutilDevice, SerialPort} from './deviceTypes';

describe('Test Device Selector', () => {
    const mcuDevices: NrfutilDevice[] = [];
    const jLinkDevices: NrfutilDevice[] = [];
    const serialPortsDevices: NrfutilDevice[] = [];

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

    beforeAll(async () => {
        await list(
            {
                mcuBoot: true,
            },
            device => mcuDevices.push(device),
            () => {}
        );

        await list(
            {
                jlink: true,
            },
            device => jLinkDevices.push(device),
            () => {}
        );

        await list(
            {
                serialPorts: true,
            },
            device => {
                const isNordicDevice =
                    device.traits.nordicUsb ||
                    device.traits.seggerUsb ||
                    device.traits.nordicDfu;

                if (!isNordicDevice) return;

                serialPortsDevices.push(device);
            },
            () => {}
        );
    });

    // can be expanded to handling Pascal's case
    describe('JLink/USB Serial/MCUboot devices are detected', () => {
        it('Detect MCUBoot devices', async () => {
            expect(mcuDevices.length).toBeGreaterThan(0);
        });

        it('Detect JLink devices', async () => {
            expect(jLinkDevices.length).toBeGreaterThan(0);

            jLinkDevices.forEach(jLinkDevice => {
                expect(jLinkDevice.jlink?.serialNumber).not.toBe('');
                expect(jLinkDevice.jlink?.boardVersion).not.toBe('');

                // skip for external jLink
                if (jLinkDevice.jlink?.boardVersion) {
                    expect(jLinkDevice.jlink.boardVersion).toContain('PCA');
                }
            });
        });

        it('Detect USB Serial devices', async () => {
            expect(serialPortsDevices.length).toBeGreaterThan(0);

            // todo: boardVersion assertion
            serialPortsDevices.forEach(spDevice => {
                expect(spDevice.serialNumber).not.toBe('');
                expect(spDevice.serialPorts?.length).toBeGreaterThan(0);

                spDevice.serialPorts?.forEach(async (sp: SerialPort) => {
                    expect(sp.comName).toContain('COM');

                    // const schemaIsValid = await validateSchema(
                    //     '#/definitions/SerialPort',
                    //     sp
                    // );
                    // expect(schemaIsValid).toBe(true);
                });
            });
        });
    });

    // uses specific filter that is used in programmer app
    it('JLink, USB Serial and MCUboot devices are detected with filters as in programmer app', async () => {
        const allDevices: Device[] = await nrfdlModule.enumerate(
            context,
            PROGRAMMER_APP_FILTERS
        );

        expect(allDevices.length).toBeGreaterThanOrEqual(MIN_DEVICE_CONNECTED);

        // test devices schemas
        allDevices.forEach(async device => {
            const schemaIsValid = await validateSchema(
                '#/definitions/Device',
                device,
                true
            );
            expect(schemaIsValid).toBe(true);
        });
    });

    xit('Enumerates external jLink device', async () => {
        const externalJLinks = jLinkDevices
            // todo: find a way for better detection
            .filter(
                d =>
                    d.usb?.device.descriptor.idVendor === 4966 &&
                    !d.traits.nordicUsb
            )
            .filter(
                d =>
                    !d.jlink?.deviceFamily ||
                    !d.jlink?.deviceFamily.toLowerCase().includes('nrf')
            );

        expect(externalJLinks.length).toBeGreaterThan(0);
        expect(typeof externalJLinks[0].jlink === 'object').toBe(true);

        const schemaIsValid = await validateSchema(
            '#/definitions/Device',
            externalJLinks[0],
            true
        );
        expect(schemaIsValid).toBe(true);
    });
});
