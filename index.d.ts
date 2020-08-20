declare module 'pc-nrfconnect-shared' {
    import { Reducer, AnyAction } from 'redux';
    import React from 'react';

    // App.jsx

    export interface AppProps {
        /**
         * A reducer function `((state, action) => newState)`.
         * 
         * If your app wants to maintain a slice of Redux state itself,
         * this is the root reducer to handle that. It will handle the
         * slice of state under the name `app`.
         */
        appReducer: Reducer<any, AnyAction>,
        /**
         * The React element that appears in the upper left corner of the app.
         * Apps usually utilise the component `DeviceSelector` for this.
         */
        deviceSelect: React.ReactElement | null,
        /**
         * The React element that appears in the hidable side panel on
         * the left side. There is no shared component for this, as
         * different side panel do not have enough in common.
         */
        sidePanel: React.ReactElement | null,
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
        panes: [string, React.FC][]
        /**
         * Describes whether the log will show automatically when the
         * application starts. Defaults to `true`.
         */
        showLogByDefault?: boolean,
    }

    export class App extends React.Component<AppProps> { }

    // DeviceSelector.jsx

    interface DeviceListing {
        usb?: boolean,
        nordicUsb?: boolean,
        seggerUsb?: boolean,
        nordicDfu?: boolean,
        serialPort?: boolean,
        jlink?: boolean
    }

    interface DeviceSetup {
        jprog?: object,
        dfu?: object,
        needSerialPort?: boolean
    }

    interface DeviceSelectorProps {
        deviceListing?: DeviceListing,
        deviceSetup?: DeviceSetup,
        releaseCurrentDevice?: () => any,
        onDeviceSelected?: (device: any) => any,
        onDeviceDeselected?: () => any,
        onDeviceIsReady?: (device: any) => any
    }

    export class DeviceSelector extends React.Component<DeviceSelectorProps> { }

    // bleChannels.js

    interface BleChannels extends Array<number> {
        min: number,
        max: number,
        isAdvertisment: (channel: number) => boolean
    }

    export const bleChannels: BleChannels
}