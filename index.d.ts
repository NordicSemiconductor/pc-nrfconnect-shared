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
            currentPane: number;
        };
        appReloadDialog: {
            isVisible: boolean;
            message: string;
        };
        device: {
            devices: readonly Device[];
            deviceInfo: any;
            isSetupDialogVisible: boolean;
            isSetupWaitingForUserInput: boolean;
            selectedSerialNumber: string;
            setupDialogChoices: readonly string[];
            setupDialogText: string | null;
        };
        errorDialog: {
            errorResolutions: any;
            isVisible: boolean;
            messages: readonly string[];
        };
        log: {
            autoScroll: boolean;
            logEntries: readonly string[];
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
        entries: readonly any[];
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
        appReducer?: Reducer<any, AnyAction>;
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

    // DeviceSelector.jsx

    interface DeviceListing {
        usb?: boolean;
        nordicUsb?: boolean;
        seggerUsb?: boolean;
        nordicDfu?: boolean;
        serialport?: boolean;
        jlink?: boolean;
    }

    interface DeviceSetup {
        jprog?: Record<string, unknown>;
        dfu?: Record<string, unknown>;
        needSerialPort?: boolean;
    }

    export interface Serialport {
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
    }

    interface Device {
        boardVersion: string;
        serialNumber: string;
        traits: readonly string[];
        nickname?: string;
        serialport?: Serialport;
        usb?: {
            product?: string;
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

    interface rangeShape {
        min: number;
        max: number;
        decimals?: number;
    }

    export class SliderProps {
        id?: string;
        title?: string;
        disabled?: boolean;
        values: readonly number[];
        range: rangeShape;
        ticks?: boolean;
        onChange: readonly ((value: number) => void)[];
        onChangeComplete?: () => void;
    }

    export class Slider extends React.Component<SliderProps> {}

    // ErrorDialog.jsx

    export interface ErrorDialogState {
        messages: readonly string[];
        isVisible: boolean;
        errorResolutions: any;
    }

    interface ErrorDialogShow {
        type: 'ERROR_DIALOG_SHOW';
        message: string;
        errorResolutions: any;
    }

    interface ErrorDialogHide {
        type: 'ERROR_DIALOG_HIDE';
    }

    type ErrorDialogAction = ErrorDialogShow | ErrorDialogHide;

    export function errorLineReducer(
        state: ErrorDialogState | undefined,
        action: ErrorDialogAction
    ): ErrorDialogState;

    export class ErrorDialog extends React.Component {}

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
        range: rangeShape;
        onChange: (value: number) => void;
        onChangeComplete?: (value: number) => void;
    }

    export class NumberInlineInput extends React.Component<NumberInlineInputProps> {}

    // Toggle.jsx

    interface ToggleProps {
        id?: string;
        title?: string;
        isToggled?: boolean;
        onToggle: (isToggled: boolean) => void;
        variant?: 'primary' | 'secondary';
        barColor?: string;
        barToggledColor?: string;
        handleColor?: string;
        handleColorToggled?: string;
        label: string;
        labelRight?: boolean;
        width?: string;
        disabled?: boolean;
    }

    export class Toggle extends React.Component<ToggleProps> {}

    // colors.js

    export const colors: {
        nordicBlue: string;
        blueSlate: string;

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
        isInitialized: boolean;
        enable: () => void;
        disable: () => void;
        isEnabled: () => void;
        reset: () => void;
        sendUsageData: <T extends string>(
            action: T,
            label: string | undefined
        ) => void;
        sendErrorReport: (error: string) => void;
    };

    export interface PackageJson {
        name: string;
        version: string;
    }

    // useHotKey.js

    export function useHotKey(
        key: string | string[],
        onKeypress: () => void
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
}
