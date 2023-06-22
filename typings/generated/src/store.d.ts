import { Reducer } from 'redux';
export declare const rootReducerSpec: (appReducer?: Reducer) => {
    app: Reducer<any, import("redux").AnyAction>;
    appLayout: Reducer<import("./App/appLayout").AppLayout, import("redux").AnyAction>;
    device: Reducer<import("./Device/deviceSlice").DeviceState, import("redux").AnyAction>;
    deviceSetup: Reducer<import("./Device/deviceSetupSlice").DeviceSetupState, import("redux").AnyAction>;
    deviceAutoSelect: Reducer<import("./Device/deviceAutoSelectSlice").DeviceAutoSelectState, import("redux").AnyAction>;
    brokenDeviceDialog: Reducer<import("./Device/BrokenDeviceDialog/brokenDeviceDialogSlice").BrokenDeviceDialog, import("redux").AnyAction>;
    errorDialog: Reducer<import("./ErrorDialog/errorDialogSlice").ErrorDialog, import("redux").AnyAction>;
    log: Reducer<import("./Log/logSlice").Log, import("redux").AnyAction>;
    shortcuts: Reducer<import("./About/shortcutSlice").ShortcutState, import("redux").AnyAction>;
    flashMessages: Reducer<import("./FlashMessage/FlashMessageSlice").FlashMessages, import("redux").AnyAction>;
};
declare const store: (appReducer?: Reducer) => import("@reduxjs/toolkit/dist/configureStore").ToolkitStore<{
    app: any;
    appLayout: import("./App/appLayout").AppLayout;
    device: import("./Device/deviceSlice").DeviceState;
    deviceSetup: import("./Device/deviceSetupSlice").DeviceSetupState;
    deviceAutoSelect: import("./Device/deviceAutoSelectSlice").DeviceAutoSelectState;
    brokenDeviceDialog: import("./Device/BrokenDeviceDialog/brokenDeviceDialogSlice").BrokenDeviceDialog;
    errorDialog: import("./ErrorDialog/errorDialogSlice").ErrorDialog;
    log: import("./Log/logSlice").Log;
    shortcuts: import("./About/shortcutSlice").ShortcutState;
    flashMessages: import("./FlashMessage/FlashMessageSlice").FlashMessages;
}, import("redux").AnyAction, import("@reduxjs/toolkit").MiddlewareArray<[import("@reduxjs/toolkit").ThunkMiddleware<{
    app: any;
    appLayout: import("./App/appLayout").AppLayout;
    device: import("./Device/deviceSlice").DeviceState;
    deviceSetup: import("./Device/deviceSetupSlice").DeviceSetupState;
    deviceAutoSelect: import("./Device/deviceAutoSelectSlice").DeviceAutoSelectState;
    brokenDeviceDialog: import("./Device/BrokenDeviceDialog/brokenDeviceDialogSlice").BrokenDeviceDialog;
    errorDialog: import("./ErrorDialog/errorDialogSlice").ErrorDialog;
    log: import("./Log/logSlice").Log;
    shortcuts: import("./About/shortcutSlice").ShortcutState;
    flashMessages: import("./FlashMessage/FlashMessageSlice").FlashMessages;
}, import("redux").AnyAction, undefined>]>>;
declare const concreteStore: import("@reduxjs/toolkit/dist/configureStore").ToolkitStore<{
    app: any;
    appLayout: import("./App/appLayout").AppLayout;
    device: import("./Device/deviceSlice").DeviceState;
    deviceSetup: import("./Device/deviceSetupSlice").DeviceSetupState;
    deviceAutoSelect: import("./Device/deviceAutoSelectSlice").DeviceAutoSelectState;
    brokenDeviceDialog: import("./Device/BrokenDeviceDialog/brokenDeviceDialogSlice").BrokenDeviceDialog;
    errorDialog: import("./ErrorDialog/errorDialogSlice").ErrorDialog;
    log: import("./Log/logSlice").Log;
    shortcuts: import("./About/shortcutSlice").ShortcutState;
    flashMessages: import("./FlashMessage/FlashMessageSlice").FlashMessages;
}, import("redux").AnyAction, import("@reduxjs/toolkit").MiddlewareArray<[import("@reduxjs/toolkit").ThunkMiddleware<{
    app: any;
    appLayout: import("./App/appLayout").AppLayout;
    device: import("./Device/deviceSlice").DeviceState;
    deviceSetup: import("./Device/deviceSetupSlice").DeviceSetupState;
    deviceAutoSelect: import("./Device/deviceAutoSelectSlice").DeviceAutoSelectState;
    brokenDeviceDialog: import("./Device/BrokenDeviceDialog/brokenDeviceDialogSlice").BrokenDeviceDialog;
    errorDialog: import("./ErrorDialog/errorDialogSlice").ErrorDialog;
    log: import("./Log/logSlice").Log;
    shortcuts: import("./About/shortcutSlice").ShortcutState;
    flashMessages: import("./FlashMessage/FlashMessageSlice").FlashMessages;
}, import("redux").AnyAction, undefined>]>>;
export type RootState = ReturnType<typeof concreteStore.getState>;
export type AppDispatch = typeof concreteStore.dispatch;
export interface NrfConnectState<AppState> extends RootState {
    app: AppState;
}
export default store;
