import { Reducer } from 'redux';
declare const _default: <AppState>(appReducer?: Reducer<AppState, import("redux").AnyAction>) => Reducer<import("redux").CombinedState<{
    appLayout: import("./App/appLayout").AppLayout;
    device: import("./Device/deviceSlice").DeviceState;
    deviceSetup: import("./Device/deviceSetupSlice").DeviceSetupState;
    deviceAutoSelect: import("./Device/deviceAutoSelectSlice").DeviceAutoSelectState;
    brokenDeviceDialog: import("./Device/BrokenDeviceDialog/brokenDeviceDialogSlice").BrokenDeviceDialog;
    errorDialog: import("./ErrorDialog/errorDialogSlice").ErrorDialog;
    log: import("./Log/logSlice").Log;
    documentation: import("./About/documentationSlice").DocumentationState;
    shortcuts: import("./About/shortcutSlice").ShortcutState;
    app: AppState;
}>, import("redux").AnyAction>;
export default _default;
