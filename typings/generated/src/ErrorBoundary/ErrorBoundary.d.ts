import React, { ReactNode } from 'react';
import { Device } from '../state';
import './error-boundary.scss';
interface Props {
    children: ReactNode;
    selectedSerialNumber?: string;
    selectedDevice?: Device;
    devices?: Device[];
    appName?: string;
    restoreDefaults?: () => void;
    sendUsageData?: (message: string) => void;
}
declare class ErrorBoundary extends React.Component<Props, {
    hasError: boolean;
    error: Error | null;
    systemReport: string | null;
}> {
    constructor(props: Props);
    static getDerivedStateFromError(error: Error): {
        hasError: boolean;
        error: Error;
    };
    componentDidCatch(error: Error): void;
    render(): React.ReactNode;
}
export default ErrorBoundary;
