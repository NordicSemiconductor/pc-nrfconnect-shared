import React, { ReactNode } from 'react';
import { Devices } from '../state';
import './error-boundary.scss';
interface Props {
    children: ReactNode;
    selectedSerialNumber?: string;
    devices: Devices;
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
declare const _default: import("react-redux").ConnectedComponent<typeof ErrorBoundary, import("react-redux").Omit<React.ClassAttributes<ErrorBoundary> & Props, "selectedSerialNumber" | "devices">>;
export default _default;
//# sourceMappingURL=ErrorBoundary.d.ts.map