import { Device, TDispatch } from '../../state';
export declare const DEFAULT_DEVICE_WAIT_TIME_MS = 3000;
declare const _default: (doSelectDevice: (device: Device, autoReconnected: boolean, forcedAutoReconnected: boolean) => void, dispatch: TDispatch) => void;
export default _default;
