import React from 'react';
import './group.scss';
export declare const CollapsibleGroup: React.FC<{
    className?: string;
    heading: string;
    title?: string;
    defaultCollapsed?: boolean | null;
    onToggled?: ((isNowExpanded: boolean) => void) | null;
}>;
export declare const Group: React.FC<{
    className?: string;
    heading?: string;
    title?: string;
}>;
