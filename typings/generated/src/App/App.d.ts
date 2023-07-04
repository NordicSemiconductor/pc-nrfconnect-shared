import 'focus-visible';
import { FC, ReactNode } from 'react';
import { Reducer } from 'redux';
import { FeedbackPaneProps } from '../Panes/FeedbackPane';
import './app.scss';
import './shared.scss';
import './tailwind.css';
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
    feedback?: boolean | FeedbackPaneProps;
    children?: ReactNode;
    autoReselectByDefault?: boolean;
}
declare const _default: ({ appReducer, ...props }: {
    appReducer?: Reducer<any, import("redux").AnyAction> | undefined;
} & ConnectedAppProps) => JSX.Element;
export default _default;
