import { LogEntry } from 'winston';
import { RootState } from '../state';
export interface Log {
    autoScroll: boolean;
    logEntries: LogEntry[];
    isLoggingVerbose: boolean;
}
export declare const autoScroll: (state: RootState) => boolean;
export declare const logEntries: (state: RootState) => LogEntry[];
export declare const isLoggingVerbose: () => boolean;
export declare const isLoggingVerboseSelector: (state: RootState) => boolean;
export declare const reducer: import("redux").Reducer<Log, import("redux").AnyAction>, addEntries: import("@reduxjs/toolkit").ActionCreatorWithPayload<LogEntry[], "log/addEntries">, clear: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"log/clear">, toggleAutoScroll: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"log/toggleAutoScroll">, toggleIsLoggingVerbose: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"log/toggleIsLoggingVerbose">;
