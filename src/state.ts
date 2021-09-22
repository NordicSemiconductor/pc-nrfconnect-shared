export interface RootState {
    appLayout: AppLayout;
    appReloadDialog: AppReloadDialog;
    errorDialog: ErrorDialog;
    log: Log;
}

export interface AppLayout {
    isSidePanelVisible: boolean;
    isLogVisible: boolean;
    currentPane: number;
    panes: AppLayoutPane[];
}

export interface AppLayoutPane {
    name: string;
}

export interface AppReloadDialog {
    isVisible: boolean;
    message: string;
}

export interface ErrorDialog {
    isVisible: boolean;
    messages: string[];
    errorResolutions?: { [key: string]: () => void };
}

export interface ErrorResolutions {
    [key: string]: () => void;
}

export interface Log {
    autoScroll: boolean;
    logEntries: LogEntry[];
}

export interface LogEntry {
    id: number;
    timestamp: string;
    level: string;
    message: string;
}
