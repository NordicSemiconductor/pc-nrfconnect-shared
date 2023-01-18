import { LogEntry } from 'winston';
import { Log, RootState } from '../state';
export declare const autoScroll: (state: RootState) => boolean;
export declare const logEntries: (state: RootState) => LogEntry[];
export declare const isLoggingVerbose: () => boolean;
export declare const isLoggingVerboseSelector: (state: RootState) => boolean;
export declare const reducer: import("redux").Reducer<Log, import("redux").AnyAction>, addEntries: import("@reduxjs/toolkit").ActionCreatorWithPayload<LogEntry[], string>, clear: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>, toggleAutoScroll: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>, toggleIsLoggingVerbose: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>;
//# sourceMappingURL=logSlice.d.ts.map