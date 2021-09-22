export interface RootState {
    appLayout: AppLayout;
    appReloadDialog: AppReloadDialog;
    errorDialog: ErrorDialog;
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
