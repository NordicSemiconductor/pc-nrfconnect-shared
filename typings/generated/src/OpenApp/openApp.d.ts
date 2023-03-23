import type { OpenAppOptions } from '../../main';
declare type AppSpec = {
    name: string;
    source: string;
};
export declare const openAppWindow: (app: AppSpec, openAppOptions?: OpenAppOptions) => void;
export {};
