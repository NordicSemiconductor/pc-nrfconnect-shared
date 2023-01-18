import { LogEntry } from 'winston';
declare class LogBuffer {
    entries: LogEntry[];
    addEntry: (entry: LogEntry) => void;
    clear(): LogEntry[];
    size(): number;
}
declare const createLogBuffer: () => LogBuffer;
export default createLogBuffer;
//# sourceMappingURL=logBuffer.d.ts.map