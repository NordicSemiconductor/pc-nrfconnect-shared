import { Device, DeviceInfo } from '../../state';
export declare const deviceInfo: (device: Device) => DeviceInfo;
export declare const displayedDeviceName: (device: Device, { respectNickname }?: {
    respectNickname?: boolean | undefined;
}) => string;
export declare const productPageUrl: (device: Device) => string | undefined;
export declare const buyOnlineUrl: (device: Device) => string | undefined;
//# sourceMappingURL=deviceInfo.d.ts.map