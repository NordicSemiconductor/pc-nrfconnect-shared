import React from 'react';
import './group.scss';
export declare const CollapsibleGroup: ({ className, heading, title, children, defaultCollapsed, onToggled, }: {
    className?: string | undefined;
    heading: string;
    title?: string | undefined;
    children?: React.ReactNode;
    defaultCollapsed?: boolean | null | undefined;
    onToggled?: ((isNowExpanded: boolean) => void) | null | undefined;
}) => JSX.Element;
export declare const Group: ({ className, heading, title, children, }: {
    className?: string | undefined;
    heading?: string | undefined;
    title?: string | undefined;
    children?: React.ReactNode;
}) => JSX.Element;
//# sourceMappingURL=Group.d.ts.map