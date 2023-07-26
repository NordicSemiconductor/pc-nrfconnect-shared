import { LogEntry, Logger } from 'winston';
interface SharedLogger extends Logger {
    initialise: () => void;
    getAndClearEntries: () => LogEntry[];
    openLogFile: () => void;
    logError: (message: string, error: unknown) => void;
}
declare const logger: SharedLogger;
export default logger;
//# sourceMappingURL=index.d.ts.map