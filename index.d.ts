/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

declare module 'pc-nrfconnect-shared' {
    import { Reducer, AnyAction } from 'redux';
    import React from 'react';
    import { Logger, LogEntry } from 'winston';
    import Store from 'electron-store';
    import { DeviceTraits } from '@nordicsemiconductor/nrf-device-lib-js';

    type Shortcut = import('./src/About/shortcutSlice').Shortcut;
    type RootState = import('./src/state').RootState;
    type Device = import('./src/state').Device;
    type DeviceInfo = import('./src/state').DeviceInfo;

    // State

    interface NrfConnectState<AppState> extends RootState {
        app: AppState;
    }

    // Logging

    interface SharedLogger extends Logger {
        getAndClearEntries: () => LogEntry[];
        openLogFile: () => void;
        logError: (message: string, error: unknown) => void;
    }

    export const logger: SharedLogger;

    // App.jsx
    export interface PaneProps {
        active: boolean;
    }

    type LegacyPane = readonly [string, React.FC<PaneProps>];

    interface Pane {
        name: string;
        Main: React.FC<PaneProps>;
        SidePanel?: React.FC;
    }

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
        appReducer?: Reducer;
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
        panes: readonly (LegacyPane | Pane)[];
        /**
         * Describes whether the log will show automatically when the
         * application starts. Defaults to `true`.
         */
        showLogByDefault?: boolean;
        /**
         * Whether to initialise google analytics for usage data if the users
         * opted in. Defaults to `false`.
         */
        reportUsageData?: boolean;
        /**
         * Describes the sections of the Documentaion card displayed in the About pane.
         *
         * Each section will have a heading, content and a button which links to the relevant website.
         */
        documentation?: React.ReactElement[] | null;
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

    // SidePanel.jsx

    export class SidePanel extends React.Component<{
        className?: string;
    }> {}

    // Group.jsx

    export class CollapsibleGroup extends React.Component<{
        className?: string;
        heading: string;
        title?: string;
        defaultCollapsed?: boolean | null;
        onToggled?: ((isNowExpanded: boolean) => void) | null;
    }> {}

    export class Group extends React.Component<{
        className?: string;
        heading?: string;
        title?: string;
    }> {}

    // Button.tsx

    export class Button extends React.Component<{
        id?: string;
        className?: string;
        onClick: React.MouseEventHandler<HTMLButtonElement>;
        disabled?: boolean;
        title?: string;
    }> {}

    // Card.tsx

    export class Card extends React.Component<{
        title: React.ReactElement | string;
    }> {}

    // DeviceSelector.jsx

    export interface DeviceSetup {
        jprog?: Record<string, unknown>;
        dfu?: Record<string, unknown>;
        needSerialport?: boolean;
        allowCustomDevice?: boolean;
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
        deviceListing: DeviceTraits;
        /**
         * If your app requires devices to be set up with a certain
         * firmware, use this property to specify how they are to be
         * programmed.
         */
        deviceSetup?: DeviceSetup;
        /**
         * This callback is invoked before a device is about to be
         * programmed. If no `deviceSetup `is provided, this callback
         * will not be invoked. If this returns a promise, programming
         * is only done after the promise is fulfilled.
         */
        releaseCurrentDevice?: () => Promise<void> | void;
        /**
         * This callback is invoked when a device is selected by
         * the user. The callback receives the selected device as
         * a parameter.
         */
        onDeviceSelected?: (device: Device) => void;
        /**
         * This callback is invoked when programming a device is
         * finished. The callback receives the programmed device
         * as a parameter. If no `deviceSetup` is provided, this
         * callback will not be invoked.
         */
        onDeviceIsReady?: (device: Device) => void;
        /**
         * This callback is invoked when a selected device is again
         * deselected. This may be caused by the user deselecting
         * the device but also automatically if programming a device
         * failed.
         */
        onDeviceDeselected?: () => void;
        /**
         * When providing this function, it is called for every device and
         * only when the function returns true, the corresponding device
         * is also displayed in the list of devices. When no function is
         * provided, all devices are shown.
         */
        deviceFilter?: (device: Device) => boolean;
    }

    /**
     * Most apps want to present a device selector to the users and
     * this component is the easiest way to achieve that. Configure
     * it appropriately for the app and then pass it to the
     * `deviceSelect` property of the `App` component.
     */
    export class DeviceSelector extends React.Component<DeviceSelectorProps> {}

    export const getDeviceLibContext: () => number;

    // bleChannels.js

    interface BleChannels extends Array<number> {
        min: number;
        max: number;
        isAdvertisement: (channel: number) => boolean;
    }

    export const bleChannels: BleChannels;

    // Logo.jsx

    export interface LogoProps {
        changeWithDeviceState: boolean;
    }

    export class Logo extends React.Component<LogoProps> {}

    // ConfirmationDialog.jsx

    export interface ConfirmationDialogProps {
        isVisible: boolean;
        title?: string;
        text?: string;
        onOk: () => void;
        onCancel: () => void;
        okButtonText?: string;
        cancelButtonText?: string;
        isInProgress?: boolean;
        isOkButtonEnabled?: boolean;
    }

    export class ConfirmationDialog extends React.Component<ConfirmationDialogProps> {}

    // Spinner.jsx

    export class Spinner extends React.Component {}

    // Slider.jsx

    export type RangeProp = import('./src/Slider/rangeShape').RangeProp;
    export type SliderProps = import('./src/Slider/Slider').Props;

    export class Slider extends React.Component<SliderProps> {}

    // ErrorDialog.jsx

    export interface ErrorDialogState {
        messages: readonly string[];
        isVisible: boolean;
        errorResolutions: any;
    }

    export const ErrorDialogActions: {
        showDialog: typeof import('./src/ErrorDialog/errorDialogSlice').showDialog;
        hideDialog: typeof import('./src/ErrorDialog/errorDialogSlice').hideDialog;
    };

    export class ErrorDialog extends React.Component {}

    // errorDialogSlice.ts

    export const errorDialogReducer: typeof import('./src/ErrorDialog/errorDialogSlice').reducer;

    // ErrorBoundary.jsx

    export class ErrorBoundary extends React.Component {}

    // InlineInput.jsx

    interface InlineInputProps {
        disabled?: boolean;
        value: string;
        isValid?: (value: string) => boolean;
        onChange: (value: string) => void;
        className?: string;
    }

    export class InlineInput extends React.Component<InlineInputProps> {}

    // NumberInlineInput.jsx

    interface NumberInlineInputProps {
        disabled?: boolean;
        value: number;
        range: RangeProp;
        onChange: (value: number) => void;
        onChangeComplete?: (value: number) => void;
    }

    export class NumberInlineInput extends React.Component<NumberInlineInputProps> {}

    // Toggle.jsx

    interface ToggleProps {
        id?: string;
        title?: string;
        isToggled?: boolean;
        onToggle?: (isToggled: boolean) => void;
        variant?: 'primary' | 'secondary';
        barColor?: string;
        barColorToggled?: string;
        handleColor?: string;
        handleColorToggled?: string;
        label?: string;
        labelRight?: boolean;
        width?: string;
        disabled?: boolean;
    }

    export class Toggle extends React.Component<ToggleProps> {}

    // Alert.tsx
    type AlertProps = import('./src/Alert/Alert').AlertProps;
    export class Alert extends React.Component<AlertProps> {}

    // StateSelector.jsx

    type StateSelectorProps = import('./src/StateSelector/StateSelector').Props;

    export class StateSelector extends React.Component<StateSelectorProps> {}

    // Drowdown.jsx
    type DropdownItem = import('./src/Dropdown/Dropdown').DropdownItem;
    type DropdownProps = import('./src/Dropdown/Dropdown').DropdownProps;

    export class Dropdown extends React.Component<DropdownProps> {}

    // StartStopButton.jsx

    interface StartStopButtonProps {
        startText?: string;
        stopText?: string;
        onClick: () => void;
        disabled?: boolean;
    }

    export class StartStopButton extends React.Component<StartStopButtonProps> {}

    // DocumentationSection.jsx

    interface DocumentationSectionProps {
        title?: string;
        linkLabel?: string;
        link?: string;
    }

    export class DocumentationSection extends React.Component<DocumentationSectionProps> {}

    // colors.js

    export const colors: {
        nordicBlue: string;
        blueSlate: string;

        white: string;
        black: string;

        primary: string;
        primaryDarkened: string;
        secondary: string;
        accent: string;
        gray50: string;
        gray100: string;
        gray200: string;
        gray300: string;
        gray400: string;
        gray500: string;
        gray600: string;
        gray700: string;
        gray800: string;
        gray900: string;

        red: string;
        indigo: string;
        amber: string;
        purple: string;
        green: string;
        deepPurple: string;
        orange: string;
        lime: string;
        pink: string;

        blueSlateLighter: string;
        greenLighter: string;
    };

    // appDirs.js

    export function setAppDirs(
        newAppDir: string,
        newAppDataDir: string,
        newAppLogDir: string
    ): void;

    export function getAppDir(): string;

    export const getUserDataDir: () => any;

    export function getAppFile(filename: string): string | undefined;

    export function getAppDataDir(): string;

    export function getAppLogDir(): string;

    // open.js

    export function openUrl(url: string): void;

    // systemReport.js

    export function systemReport(
        allDevices: readonly Device[],
        currentSerialNumber: string,
        currentDevice: any
    ): Promise<void>;

    // usageData.js

    export const usageData: {
        init: (packageJson: PackageJson) => Promise<void>;
        isInitialized: () => boolean;
        enable: () => void;
        disable: () => void;
        isEnabled: () => void;
        reset: () => void;
        sendUsageData: <T extends string>(action: T, label?: string) => void;
        sendErrorReport: (error: string) => void;
    };

    interface ObjectContainingOptionalStrings {
        [index: string]: string | undefined;
    }

    export interface PackageJson {
        name: string;
        version: string;

        // Several optional properties
        author?: string;
        bin?: ObjectContainingOptionalStrings | string;
        dependencies?: ObjectContainingOptionalStrings;
        description?: string;
        devDependencies?: ObjectContainingOptionalStrings;
        displayName?: string;
        engines?: ObjectContainingOptionalStrings;
        files?: readonly string[];
        license?: string;
        main?: string;
        peerDependencies?: ObjectContainingOptionalStrings;
        repository?: {
            type: string;
            url: string;
        };
        scripts?: ObjectContainingOptionalStrings;

        // Catch all for all remaining properties
        [index: string]: any;
    }

    // useHotKey.js

    export function useHotKey(
        shortcut: Shortcut,
        deps?: React.DependencyList
    ): void;

    // Legacy API for the same function
    export function useHotKey(
        hotKey: string | string[],
        action: () => void
    ): void;

    // classNames.js

    /**
     * Combine a list of class names into a space separated strings.
     * Filters out all values that are not strings. The idea of this function is
     * to use it with conditionals and potentially unset values like this:
     *
     *     classNames(
     *          'fixed-class-name',
     *          isVisible && 'visible',
     *          isEnabled ? 'enabled' : 'disabled',
     *          potentiallyUndefined,
     *     )
     */
    export function classNames(...className: unknown[]): string;

    // truncateMiddle.ts
    /**
     * Truncate middle of a string if it is too long.
     */
    export const truncateMiddle: (
        str: string,
        clipStart?: number,
        clipEnd?: number
    ) => string;

    // environment.ts
    /**
     * Determine if environment is in development mode.
     */
    export const isDevelopment: boolean;

    // appLayout.js

    /**
     * Create a Redux action to set the currently active pane.
     */
    export function setCurrentPane(currentPane: number): AnyAction;

    /**
     * A selector to determine the number of the currently active pane.
     */
    export function currentPane<AppState>(
        state: NrfConnectState<AppState>
    ): number;

    // logSlice.js

    export function isLoggingVerbose(): boolean;

    // persistentStore.ts

    /**
     * Return a persistent store, specific for the app.
     * The app name from package.json is used to identify the app.
     */
    export function getPersistentStore<
        StoreSchema extends Record<string, any>
    >(): Store<StoreSchema>;

    export const deviceInfo: (device: Device) => DeviceInfo;

    // sdfuOperations.js
    export class sdfuOperations {
        static createDfuZipBuffer(inputDfuImages: DfuImage[]): string | Buffer;
    }

    // deviceLister.ts
    export function waitForDevice(serialNumber: string): Device;

    // initPacket.ts
    export type DfuImage = import('./src/Device/initPacket').DfuImage;
    export type InitPacket = import('./src/Device/initPacket').InitPacket;
    export const defaultInitPacket: InitPacket;
    export const FwType: typeof import('./src/Device/initPacket').FwType;
    export const HashType: typeof import('./src/Device/initPacket').HashType;

    // deviceSlice.ts
    export const selectedDevice: (state: RootState) => Device | undefined;

    // describeError.ts
    export const describeError: (error: unknown) => string;

    // SerialPort.ts
    export const SerialPort: typeof import('./src/SerialPort/SerialPort').SerialPort;
    export const SERIALPORT_CHANNEL: typeof import('./src/SerialPort/SerialPort').SERIALPORT_CHANNEL;
}

declare module 'prettysize' {
    export default function pretty(n: number): string;
}

declare module '*.module.scss' {
    const properties: {
        [property: string]: string;
    };
    export = properties;
}

interface Window {
    appDir: string;
    appDataDir: string;
    appLogDir: string;
}

// Let typescript compiler in `npm run lint` resolve css modules
declare module '*.icss.scss';
declare module '*.gif';
declare module '*.png';
