export interface RootState {
    appLayout: AppLayout;
    appReloadDialog: AppReloadDialog;
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
