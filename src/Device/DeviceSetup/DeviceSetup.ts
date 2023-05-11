/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import type { RootState, TDispatch } from '../../state';
import { receiveDeviceSetupInput } from '../deviceSetup';
import DeviceSetupView from './DeviceSetupView';

const mapStateToProps = ({
    device: {
        isSetupDialogVisible,
        isSetupWaitingForUserInput,
        setupDialogText,
        setupDialogChoices,
        progress,
        progressMessage,
    },
}: RootState) => ({
    isVisible: isSetupDialogVisible,
    isInProgress: isSetupDialogVisible && !isSetupWaitingForUserInput,
    text: setupDialogText,
    choices: setupDialogChoices,
    progress,
    progressMessage,
});

const mapDispatchToProps = (dispatch: TDispatch) => ({
    onOk: (input: string | boolean) => dispatch(receiveDeviceSetupInput(input)),
    onCancel: () => dispatch(receiveDeviceSetupInput(false)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DeviceSetupView);
