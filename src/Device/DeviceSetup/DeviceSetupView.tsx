/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { ProgressBar } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { useDispatch, useSelector } from 'react-redux';

import { Dialog, DialogButton } from '../../Dialog/Dialog';
import { Group } from '../../SidePanel/Group';
import {
    deviceSetupUserInputReceived,
    getDeviceSetupChoices,
    getDeviceSetupMessage,
    getDeviceSetupProgress,
    getDeviceSetupProgressMessage,
    getDeviceSetupUserInputCallback,
    isDeviceSetupDialogVisible,
} from '../deviceSetupSlice';

export default () => {
    const dispatch = useDispatch();
    const [selectedChoices, setSelectedChoices] = useState<number>(0);
    const isVisible = useSelector(isDeviceSetupDialogVisible);
    const message = useSelector(getDeviceSetupMessage);
    const progressMessage = useSelector(getDeviceSetupProgressMessage);
    const progress = useSelector(getDeviceSetupProgress);
    const choices = useSelector(getDeviceSetupChoices);
    const onUserInput = useSelector(getDeviceSetupUserInputCallback);

    const isInProgress = progress !== undefined;

    return (
        <Dialog isVisible={isVisible}>
            <Dialog.Header
                showSpinner={isInProgress}
                title="Confirm"
                headerIcon=""
            />
            <Dialog.Body>
                <Group>
                    <div>{message}</div>
                    {choices && (
                        <Form.Group>
                            {choices.map((choice, index) => (
                                <Form.Check
                                    key={choice}
                                    name="radioGroup"
                                    type="radio"
                                    disabled={isInProgress}
                                    onClick={() => setSelectedChoices(index)}
                                    label={choice}
                                />
                            ))}
                        </Form.Group>
                    )}
                    {progressMessage !== undefined && (
                        <Form.Label>
                            <strong>Status:</strong>
                            <span>{` ${progressMessage}`}</span>
                        </Form.Label>
                    )}
                    {progress !== undefined && (
                        <ProgressBar
                            now={progress}
                            animated
                            label={`${progress}%`}
                        />
                    )}
                </Group>
            </Dialog.Body>
            <Dialog.Footer>
                <DialogButton
                    variant="primary"
                    onClick={() => {
                        if (onUserInput) {
                            dispatch(deviceSetupUserInputReceived());
                            onUserInput(
                                false,
                                choices ? selectedChoices : undefined
                            );
                        }
                    }}
                    disabled={!onUserInput || isInProgress}
                >
                    Program
                </DialogButton>
                <DialogButton
                    onClick={() => {
                        if (onUserInput) {
                            dispatch(deviceSetupUserInputReceived());
                            onUserInput(true);
                        }
                    }}
                    disabled={isInProgress}
                >
                    Cancel
                </DialogButton>
            </Dialog.Footer>
        </Dialog>
    );
};
