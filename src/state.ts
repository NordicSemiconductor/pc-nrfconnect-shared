export interface RootState {
    appLayout: AppLayout;
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
