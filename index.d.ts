declare module 'pc-nrfconnect-shared' {
    import { Reducer, AnyAction } from 'redux';
    import React from 'react';
    import winston from 'winston';

    // State

    interface NrfConnectState<AppState> {
        app: AppState;
        appLayout: {
            isSidePanelVisible: boolean;
            isLogVisible: boolean;
        };
        appReloadDialog: {
            isVisible: boolean;
            message: string;
        };
        device: {
            devices: Device[];
            deviceInfo: any;
            isSetupDialogVisible: boolean;
            isSetupWaitingForUserInput: boolean;
            selectedSerialNumber: string;
            setupDialogChoices: string[];
            setupDialogText: string | null;
        };
        errorDialog: {
            errorResolutions: any;
            isVisible: boolean;
            messages: string[];
        };
        log: {
            autoScroll: boolean;
            logEntries: string[];
        };
    }

    // Actions

    enum NrfConnectActionType {
        LOG_ADD_ENTRIES = 'LOG_ADD_ENTRIES',
        LOG_CLEAR_ENTRIES = 'LOG_CLEAR_ENTRIES',
        LOG_TOGGLE_AUTOSCROLL = 'LOG_TOGGLE_AUTOSCROLL',
    }

    interface LogAddEntries {
        type: NrfConnectActionType.LOG_ADD_ENTRIES;
        entries: any[];
    }

    interface LogClearEntries {
        type: NrfConnectActionType.LOG_CLEAR_ENTRIES;
    }

    interface LogToggleAutoscroll {
        type: NrfConnectActionType.LOG_TOGGLE_AUTOSCROLL;
    }

    export type NrfConnectAction =
        | LogAddEntries
        | LogClearEntries
        | LogToggleAutoscroll;

    // Logging

    export const logger: winston.Logger;

    // App.jsx

    /**
     * Props for the `App` component.
     */
    export interface AppProps {
        /**
         * A reducer function `((state, action) => newState)`.
         *
         * If your app wants to maintain a slice of Redux state itself,
         * this is the root reducer to handle that. It will handle the
         * slice of state under the name `app`.
         */
        appReducer: Reducer<any, AnyAction>;
        /**
         * The React element that appears in the upper left corner of the app.
         * Apps usually utilise the component `DeviceSelector` for this.
         */
        deviceSelect: React.ReactElement | null;
        /**
         * The React element that appears in the hidable side panel on
         * the left side. There is no shared component for this, as
         * different side panel do not have enough in common.
         */
        sidePanel: React.ReactElement | null;
        /**
         * Describes the panes that users can see in the main view.
         *
         * Each has a clickable name in the navigation at the top and
         * when clicked, the pane is displayed in the main view of
         * the app.
         *
         * The panes property is an array containing two element arrays:
         *
         * Each of the two element arrays has the name of the pane as the
         * first element (which is displayed in the navigation bar) and
         * the React component as the second element. For example:
         *
         * `[['Connection Map', ConnectionMap], ['Server Setup', ServerSetup]]`
         */
        panes: [string, React.FC][];
        /**
         * Describes whether the log will show automatically when the
         * application starts. Defaults to `true`.
         */
        showLogByDefault?: boolean;
    }

    /**
     * Most apps will use the `App` component to create their main
     * export. Visible to the user, it provides the general app look
     * and feel:
     *
     * * Device selector on the top left
     * * Hidable sidebar on the left side
     * * Multiple panes, including an “About” pane, which can be
     * switched in the navigation bar at the top and appear in the main
     * area below it
     * * Hidable log viewer below the main area
     *
     * For the developer it provides a scaffolding to place their own
     * components and a prepared Redux store, which includes state and
     * actions for the shared components.
     *
     * Note that you cannot easily use the Redux store when creating
     * the `App` element, as the store will be created and provided by
     * the `App` component. But you can use it about everywhere else,
     * usually through React Redux using either hooks or the connect
     * function.)
     */
    export class App extends React.Component<AppProps> {}

    /**
     * Wraps the contents of your pane.
     */
    export class Main extends React.Component {}

    // DeviceSelector.jsx

    interface DeviceListing {
        usb?: boolean;
        nordicUsb?: boolean;
        seggerUsb?: boolean;
        nordicDfu?: boolean;
        serialPort?: boolean;
        jlink?: boolean;
    }

    interface DeviceSetup {
        jprog?: Record<string, unknown>;
        dfu?: Record<string, unknown>;
        needSerialPort?: boolean;
    }

    interface Device {
        boardVersion: string;
        serialNumber: string;
        traits: string[];
        serialport: {
            path: string;
            manufacturer: string;
            productId: string;
            serialNumber: string;
            vendorId: string;
            pnpId?: string;
            /**
             * @deprecated Using the property `comName` has been
             * deprecated. You should now use `path`. The property
             * will be removed in the next major release.
             */
            comName: string;
        };
    }

    /**
     * Props for the `DeviceSelector` component.
     */
    interface DeviceSelectorProps {
        /**
         * Configures which device types to show in the device selector,
         * e.g. whether to show only J-Link devices or also those
         * just connected through a normal serial port.
         */
        deviceListing: DeviceListing;
        /**
         * If your app requires devices to be set up with a certain
         * firmware, use this property to specify how they are to be
         * programmed.
         */
        deviceSetup?: DeviceSetup;
        /**
         * This callback is invoked before a device is about to be
         * rogrammed. If no `deviceSetup `is provided, this callback
         * will not be invoked.
         */
        releaseCurrentDevice?: () => any;
        /**
         * This callback is invoked when a device is selected by
         * the user. The callback receives the selected device as
         * a parameter.
         */
        onDeviceSelected?: (device: Device) => any;
        /**
         * This callback is invoked when programming a device is
         * finished. The callback receives the programmed device
         * as a parameter. If no `deviceSetup` is provided, this
         * callback will not be invoked.
         */
        onDeviceIsReady?: (device: Device) => any;
        /**
         * This callback is invoked when a selected device is again
         * deselected. This may be caused by the user deselecting
         * the device but also automatically if programming a device
         * failed.
         */
        onDeviceDeselected?: () => any;
    }

    /**
     * Most apps want to present a device selector to the users and
     * this component is the easiest way to achieve that. Configure
     * it appropriately for the app and then pass it to the
     * `deviceSelect` property of the `App` component.
     */
    export class DeviceSelector extends React.Component<DeviceSelectorProps> {}

    // bleChannels.js

    interface BleChannels extends Array<number> {
        min: number;
        max: number;
        isAdvertisment: (channel: number) => boolean;
    }

    export const bleChannels: BleChannels;
}
