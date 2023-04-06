import React from 'react';
type Variant = 'info' | 'warning' | 'success' | 'danger';
export interface AlertProps {
    variant: Variant;
    label?: React.ReactElement | string;
    dismissable?: boolean;
    onClose?: () => void;
}
export declare const Alert: React.FC<AlertProps>;
export {};
