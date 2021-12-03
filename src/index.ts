/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import dispatchTo from '../test/dispatchTo';
import { testRendererForApps } from '../test/testrenderer';
import { hideDialog, showDialog } from './ErrorDialog/errorDialogSlice';
import rootReducer from './rootReducer';

const ErrorDialogActions = { hideDialog, showDialog };

export { ErrorDialogActions };

export { default as App } from './App/App';
export { default as Logo } from './Logo/Logo';
export { default as DeviceSelector } from './Device/DeviceSelector/DeviceSelector';
export { default as ConfirmationDialog } from './Dialog/ConfirmationDialog';
export { default as Spinner } from './Dialog/Spinner';
export { default as Slider } from './Slider/Slider';
export { Toggle } from './Toggle/Toggle';
export { Alert } from './Alert/Alert';
export { default as Main } from './Main/Main';
export { default as Card } from './Card/Card';
export { default as ErrorBoundary } from './ErrorBoundary/ErrorBoundary';
export { default as StateSelector } from './StateSelector/StateSelector';
export { default as Dropdown } from './Dropdown/Dropdown';
export { default as StartStopButton } from './StartStopButton/StartStopButton';
export { default as DocumentationSection } from './About/DocumentationSection';

export { default as SidePanel } from './SidePanel/SidePanel';
export { Group, CollapsibleGroup } from './SidePanel/Group';

export { default as ErrorDialog } from './ErrorDialog/ErrorDialog';
export { default as InlineInput } from './InlineInput/InlineInput';
export { default as NumberInlineInput } from './InlineInput/NumberInlineInput';

export { reducer as errorDialogReducer } from './ErrorDialog/errorDialogSlice';
export { default as logger } from './logging';
export { default as bleChannels } from './utils/bleChannels';
export { default as colors } from './utils/colors.icss.scss';

export {
    setAppDirs,
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

export { default as useHotKey } from './utils/useHotKey';

export { currentPane, setCurrentPane } from './App/appLayout';

export { getAppSpecificStore as getPersistentStore } from './utils/persistentStore';

export { selectedDevice } from './Device/deviceSlice';
export { deviceInfo } from './Device/deviceInfo/deviceInfo';
export {
    getDeviceLibContext,
    stopWatchingDevices,
    startWatchingDevices,
    waitForDevice,
} from './Device/deviceLister';
export { default as sdfuOperations } from './Device/sdfuOperations';
export { defaultInitPacket, HashType, FwType } from './Device/initPacket';

export const testUtils = {
    dispatchTo,
    render: testRendererForApps,
    rootReducer,
};
