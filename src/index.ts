/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { hideDialog, showDialog } from './ErrorDialog/errorDialogSlice';

export const ErrorDialogActions = { hideDialog, showDialog };

export { default as App, render, type PaneProps } from './App/App';
export { default as Logo } from './Logo/Logo';
export {
    default as DeviceSelector,
    type Props as DeviceSelectorProps,
} from './Device/DeviceSelector/DeviceSelector';
export {
    Dialog,
    GenericDialog,
    ConfirmationDialog,
    InfoDialog,
    ErrorDialog,
    DialogButton,
} from './Dialog/Dialog';
export type { DialogButtonProps } from './Dialog/Dialog';
export { default as Slider } from './Slider/Slider';
export { Toggle } from './Toggle/Toggle';
export { default as RootErrorDialog } from './ErrorDialog/ErrorDialog';
export { Alert } from './Alert/Alert';
export { default as Main } from './Main/Main';
export { default as Button } from './Button/Button';
export type { ButtonVariants } from './Button/Button';
export { default as Card } from './Card/Card';
export { default as ErrorBoundary } from './ErrorBoundary/ErrorBoundary';
export { default as StateSelector } from './StateSelector/StateSelector';
export { default as Dropdown, type DropdownItem } from './Dropdown/Dropdown';
export { default as StartStopButton } from './StartStopButton/StartStopButton';
export { default as DocumentationSection } from './About/DocumentationSection';
export { default as Stepper } from './Stepper/Stepper';
export type { Step } from './Stepper/Stepper';

export { default as SidePanel } from './SidePanel/SidePanel';
export { Group, CollapsibleGroup } from './SidePanel/Group';

export { default as InlineInput } from './InlineInput/InlineInput';
export { default as NumberInlineInput } from './InlineInput/NumberInlineInput';
export { default as NumberInputSliderWithUnit } from './NumberInputWithSlider/NumberInputSliderWithUnit';

export { default as Spinner } from './Spinner/Spinner';

export { default as MasonryLayout } from './MasonryLayout/MasonryLayout';

export { default as useStopwatch } from './utils/useStopwatch';
export { default as useFocusedOnVisible } from './utils/useFocusedOnVisible';

export { reducer as errorDialogReducer } from './ErrorDialog/errorDialogSlice';
export { default as logger } from './logging';
export { default as bleChannels } from './utils/bleChannels';
export { colors } from './utils/colors';

export {
    getAppDir,
    getAppFile,
    getAppDataDir,
    getAppLogDir,
    getUserDataDir,
} from './utils/appDirs';

export { openUrl } from './utils/open';
export { default as systemReport } from './utils/systemReport';

export { default as usageData } from './utils/usageData';
export { default as classNames } from './utils/classNames';
export { truncateMiddle } from './utils/truncateMiddle';

export { default as useHotKey } from './utils/useHotKey';
export { isDevelopment } from './utils/environment';

export { currentPane, setCurrentPane } from './App/appLayout';

export { isLoggingVerbose } from './Log/logSlice';

export {
    getAppSpecificStore as getPersistentStore,
    persistTerminalSettings,
    getPersistedTerminalSettings,
    persistNickname,
    getPersistedNickname,
} from './utils/persistentStore';

export { jprogDeviceSetup } from './Device/jprogOperations';

export { sdfuDeviceSetup } from './Device/sdfuOperations';

export {
    selectedDevice,
    getReadbackProtection,
    persistSerialPortOptions,
    type Device,
} from './Device/deviceSlice';
export {
    setWaitForDevice,
    getAutoReselect,
    getWaitingForDeviceTimeout,
    getWaitingToAutoReselect,
    getWaitForDevice,
} from './Device/deviceAutoSelectSlice';
export { clearWaitForDevice } from './Device/deviceLister';
export { deviceInfo } from './Device/deviceInfo/deviceInfo';
export { getDeviceLibContext } from './Device/deviceLibWrapper';
export { isDeviceInDFUBootloader } from './Device/sdfuOperations';
export {
    default as sdfuOperations,
    switchToBootloaderMode,
    switchToApplicationMode,
} from './Device/sdfuOperations';
export {
    defaultInitPacket,
    type DfuImage,
    FwType,
    HashType,
} from './Device/initPacket';

export { default as describeError } from './logging/describeError';

export {
    createSerialPort,
    getSerialPortOptions,
    type SerialPort,
} from './SerialPort/SerialPort';
export { default as ConflictingSettingsDialog } from './SerialPort/ConflictingSettingsDialog';

export type { AppDispatch, AppThunk, NrfConnectState } from './store';

export {
    type DeviceSetupConfig,
    type DeviceSetup,
    prepareDevice,
} from './Device/deviceSetup';

export {
    addNewMessage,
    newCopiedFlashMessage,
    newInfoFlashMessage,
    newWarningFlashMessage,
    newErrorFlashMessage,
    newSuccessFlashMessage,
} from './FlashMessage/FlashMessageSlice';

export {
    inMain as apps,
    type App as AppType,
    type AppSpec,
    type AppWithError,
    type DownloadableApp,
    type InstalledDownloadableApp,
    type LaunchableApp,
    type LocalApp,
    type SourceWithError,
    type UninstalledDownloadableApp,
    type WithdrawnApp,
} from '../ipc/apps';
export { inMain as openWindow } from '../ipc/openWindow';
export { inMain as preventSleep } from '../ipc/preventSleep';
