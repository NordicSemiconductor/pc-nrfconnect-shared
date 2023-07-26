import { LogEntry } from 'winston';
import Transport, { TransportStreamOptions } from 'winston-transport';
interface Options extends TransportStreamOptions {
    onLogEntry: (entry: LogEntry) => void;
}
export default class AppTransport extends Transport {
    private onLogEntry;
    private entryCount;
    constructor(options: Options);
    log({ level, message, timestamp }: LogEntry, next: () => void): void;
}
export {};
//# sourceMappingURL=appTransport.d.ts.map