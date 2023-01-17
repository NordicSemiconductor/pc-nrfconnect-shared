import { Reducer } from 'redux';
declare const _default: <AppState>(appReducer?: Reducer<AppState, import("redux").AnyAction>) => Reducer<import("redux").CombinedState<{
    appLayout: import("./state").AppLayout;
    device: import("./state").DeviceState;
    brokenDeviceDialog: import("./state").BrokenDeviceDialog;
    errorDialog: import("./state").ErrorDialog;
    log: import("./state").Log;
    documentation: import("./About/documentationSlice").DocumentationState;
    shortcuts: import("./About/shortcutSlice").ShortcutState;
    app: AppState;
}>, import("redux").AnyAction>;
export default _default;
