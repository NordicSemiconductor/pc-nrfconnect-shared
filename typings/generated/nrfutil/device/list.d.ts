import { DeviceTraits, NrfutilDevice, NrfutilDeviceWithSerialnumber } from './common';
export interface HotplugEvent {
    id: number;
    event: 'Arrived' | 'Left';
    device?: NrfutilDevice;
}
export interface ListEvent {
    devices: NrfutilDevice[];
}
declare const _default: (traits: DeviceTraits, onEnumerated: (devices: NrfutilDeviceWithSerialnumber[]) => void, onError: (error: Error) => void, onHotplugEvent?: {
    onDeviceArrived: (device: NrfutilDeviceWithSerialnumber) => void;
    onDeviceLeft: (id: number) => void;
} | undefined, timeout?: number) => Promise<{
    stop: (handler: () => void) => void;
    isRunning: () => boolean;
    onClosed: (handler: (error?: Error | undefined) => void) => () => ((error?: Error | undefined) => void)[];
}>;
export default _default;
//# sourceMappingURL=list.d.ts.map