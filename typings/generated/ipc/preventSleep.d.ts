type End = (id: number) => void;
export declare const forRenderer: {
    registerStart: (handler: (() => number) | (() => Promise<number>)) => void;
    registerEnd: (handler: End) => Electron.IpcMain;
};
export declare const inMain: {
    start: () => Promise<number>;
    end: (id: number) => void;
};
export {};
//# sourceMappingURL=preventSleep.d.ts.map