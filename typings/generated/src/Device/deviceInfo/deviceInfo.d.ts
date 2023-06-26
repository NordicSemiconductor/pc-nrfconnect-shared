/// <reference types="react" />
import { Device } from '../deviceSlice';
interface DeviceInfo {
    name?: string | null;
    cores?: number;
    icon: React.ElementType;
    website: {
        productPagePath?: string;
        buyOnlineParams?: string;
    };
}
export declare const deviceInfo: (device: Device) => DeviceInfo;
export declare const displayedDeviceName: (device: Device, { respectNickname }?: {
    respectNickname?: boolean | undefined;
}) => string;
export declare const productPageUrl: (device: Device) => string | undefined;
export declare const buyOnlineUrl: (device: Device) => string | undefined;
export {};
