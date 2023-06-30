import { AnyAction, ThunkAction } from '@reduxjs/toolkit';
import { Reducer } from 'redux';
export declare const rootReducerSpec: (appReducer?: Reducer) => {
    app: Reducer<any, AnyAction>;
    appLayout: Reducer<import("./App/appLayout").AppLayout, AnyAction>;
    device: Reducer<import("./Device/deviceSlice").DeviceState, AnyAction>;
    deviceSetup: Reducer<import("./Device/deviceSetupSlice").DeviceSetupState, AnyAction>;
    deviceAutoSelect: Reducer<import("./Device/deviceAutoSelectSlice").DeviceAutoSelectState, AnyAction>;
    brokenDeviceDialog: Reducer<import("./Device/BrokenDeviceDialog/brokenDeviceDialogSlice").BrokenDeviceDialog, AnyAction>;
    errorDialog: Reducer<import("./ErrorDialog/errorDialogSlice").ErrorDialog, AnyAction>;
    log: Reducer<import("./Log/logSlice").Log, AnyAction>;
    shortcuts: Reducer<import("./About/shortcutSlice").ShortcutState, AnyAction>;
    flashMessages: Reducer<import("./FlashMessage/FlashMessageSlice").FlashMessages, AnyAction>;
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
}, AnyAction, import("@reduxjs/toolkit").MiddlewareArray<[import("@reduxjs/toolkit").ThunkMiddleware<{
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
}, AnyAction, undefined>]>>;
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
}, AnyAction, import("@reduxjs/toolkit").MiddlewareArray<[import("@reduxjs/toolkit").ThunkMiddleware<{
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
}, AnyAction, undefined>]>>;
export type TAction<T> = ThunkAction<T, RootState, null, AnyAction>;
export type RootState = ReturnType<typeof concreteStore.getState>;
export type AppDispatch = typeof concreteStore.dispatch;
export interface NrfConnectState<AppState> extends RootState {
    app: AppState;
}
export default store;
