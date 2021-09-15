/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import { receiveDeviceSetupInput } from '../deviceSetup';
import DeviceSetupView from './DeviceSetupView';

const mapStateToProps = ({
    device: {
        isSetupDialogVisible,
        isSetupWaitingForUserInput,
        setupDialogText,
        setupDialogChoices,
    },
}) => ({
    isVisible: isSetupDialogVisible,
    isInProgress: isSetupDialogVisible && !isSetupWaitingForUserInput,
    text: setupDialogText,
    choices: setupDialogChoices,
});

const mapDispatchToProps = dispatch => ({
    onOk: input => dispatch(receiveDeviceSetupInput(input)),
    onCancel: () => dispatch(receiveDeviceSetupInput(false)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DeviceSetupView);
