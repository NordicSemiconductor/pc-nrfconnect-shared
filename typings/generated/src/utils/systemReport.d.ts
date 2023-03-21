import { Device } from '../state';
export declare const generateSystemReport: (timestamp: string, allDevices?: Device[], currentDevice?: Device, currentSerialNumber?: string) => Promise<string>;
declare const _default: (allDevices: Device[], currentSerialNumber: string, currentDevice: Device | null) => Promise<void>;
export default _default;
