import { FC } from 'react';
import { LogEntry as winstonLogEntry } from 'winston';
import './log-entry.scss';
interface Props {
    entry: winstonLogEntry;
}
declare const LogEntry: FC<Props>;
export default LogEntry;
