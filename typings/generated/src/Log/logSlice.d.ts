import { LogEntry } from 'winston';
import type { RootState } from '../store';
export interface Log {
    autoScroll: boolean;
    logEntries: LogEntry[];
    isLoggingVerbose: boolean;
}
export declare const autoScroll: (state: RootState) => boolean;
export declare const logEntries: (state: RootState) => LogEntry[];
export declare const isLoggingVerbose: (state: RootState) => boolean;
export declare const reducer: import("redux").Reducer<Log, import("redux").AnyAction>, addEntries: import("@reduxjs/toolkit").ActionCreatorWithPayload<LogEntry[], "log/addEntries">, clear: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"log/clear">, toggleAutoScroll: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"log/toggleAutoScroll">, setIsLoggingVerbose: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "log/setIsLoggingVerbose">;
//# sourceMappingURL=logSlice.d.ts.map