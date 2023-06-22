import 'focus-visible';
import { FC, ReactNode } from 'react';
import { Reducer } from 'redux';
import './app.scss';
import './shared.scss';
export interface ExternalPaneProps {
    active: boolean;
}
export interface Pane {
    name: string;
    Main: FC<ExternalPaneProps>;
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
