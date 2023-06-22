import 'focus-visible';
import React, { FC, ReactNode } from 'react';
import { Reducer } from 'redux';
import './app.scss';
import './shared.scss';
export interface PaneProps {
    active: boolean;
}
export interface Pane {
    name: string;
    Main: FC<PaneProps>;
    SidePanel?: FC;
}
interface ConnectedAppProps {
    deviceSelect?: ReactNode;
    panes: Pane[];
    sidePanel?: ReactNode;
    showLogByDefault?: boolean;
    reportUsageData?: boolean;
    documentation?: ReactNode[];
    children?: ReactNode;
    autoReselectByDefault?: boolean;
}
declare const _default: ({ appReducer, ...props }: {
    appReducer?: Reducer<any, import("redux").AnyAction> | undefined;
} & ConnectedAppProps) => JSX.Element;
export default _default;
export declare const render: (App: React.ReactNode) => void;
