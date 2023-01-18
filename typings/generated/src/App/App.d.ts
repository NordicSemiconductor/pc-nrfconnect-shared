import 'focus-visible';
import { FC, ReactNode } from 'react';
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
    autoReconnectByDefault?: boolean;
}
declare const App: {
    ({ appReducer, ...props }: {
        appReducer?: Reducer<any, import("redux").AnyAction> | undefined;
    } & ConnectedAppProps): JSX.Element;
    propTypes: {
        appReducer: import("prop-types").Requireable<(...args: any[]) => any>;
    };
};
export default App;
