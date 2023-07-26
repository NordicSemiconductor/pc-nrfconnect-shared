export interface ITimer {
    now: () => number;
    setTimeout: (callback: () => void, ms: number) => () => void;
}
export type Stopwatch = {
    autoStart: boolean;
    resolution?: number;
    timer?: ITimer;
};
declare const _default: ({ autoStart, timer, resolution, }: Stopwatch) => {
    start: (elapsedTime?: any) => void;
    pause: () => void;
    reset: () => void;
    isRunning: boolean;
    time: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    millisecond: number;
};
export default _default;
//# sourceMappingURL=useStopwatch.d.ts.map