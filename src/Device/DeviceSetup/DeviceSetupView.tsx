/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';

import { Dialog, DialogButton } from '../../Dialog/Dialog';
import { Group } from '../../SidePanel/Group';

export interface DeviceSetupViewProps {
    isVisible: boolean;
    isInProgress: boolean;
    text?: string | null;
    choices: readonly string[];
    onOk: (choice: { choice: string; index: number } | boolean) => void;
    onCancel: () => void;
    progress?: number;
    progressMessage?: string;
}

interface State {
    selectedChoice: null | { choice: string; index: number };
}

/**
 * Dialog that allows the user to provide input that is required during device setup
 * (programming/DFU). If the 'choices' prop is provided, then the user will see a
 * list of choices, and select one of them. If not, then user will just respond yes/no.
 *
 * The 'onConfirm' callback is called with one of the choices or just true if it is a
 * simple yes/no confirmation. Shows a spinner and disables input if the 'isInProgress'
 * prop is set to true.
 */
export default class DeviceSetupDialog extends React.Component<
    DeviceSetupViewProps,
    State
> {
    constructor(props: DeviceSetupViewProps) {
        super(props);
        this.onSelectChoice = this.onSelectChoice.bind(this);
        this.state = {
            selectedChoice: null,
        };
    }

    onSelectChoice(choice: string, index: number) {
        this.setState({ selectedChoice: { choice, index } });
    }

    render() {
        const {
            isVisible,
            isInProgress,
            text,
            choices,
            onOk,
            onCancel,
            progress,
            progressMessage,
        } = this.props;
        const { selectedChoice } = this.state;

        if (choices && choices.length > 0) {
            return (
                <Dialog isVisible={isVisible}>
                    <Dialog.Header
                        showSpinner={isInProgress}
                        title="Confirm"
                        headerIcon=""
                    />
                    <Dialog.Body>
                        <Group>
                            <div>{text}</div>
                            <Form.Group>
                                {choices.map((choice, index) => (
                                    <Form.Check
                                        key={choice}
                                        name="radioGroup"
                                        type="radio"
                                        disabled={isInProgress}
                                        onClick={() =>
                                            this.onSelectChoice(choice, index)
                                        }
                                        label={choice}
                                    />
                                ))}
                            </Form.Group>
                            {progressMessage !== undefined && (
                                <Form.Label>
                                    <strong>Status:</strong>
                                    <span>{` ${progressMessage}`}</span>
                                </Form.Label>
                            )}
                            {progress !== undefined && (
                                <ProgressBar
                                    now={progress}
                                    style={{ height: '4px' }}
                                />
                            )}
                        </Group>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <DialogButton
                            variant="primary"
                            onClick={() => onOk(selectedChoice ?? false)}
                            disabled={!selectedChoice || isInProgress}
                        >
                            Program
                        </DialogButton>
                        <DialogButton
                            onClick={onCancel}
                            disabled={isInProgress}
                        >
                            Cancel
                        </DialogButton>
                    </Dialog.Footer>
                </Dialog>
            );
        }
        return (
            <Dialog isVisible={isVisible}>
                <Dialog.Header
                    showSpinner={isInProgress}
                    title="Program device"
                    headerIcon=""
                />
                <Dialog.Body>
                    <Group>
                        <div>{text}</div>
                        {progressMessage !== undefined && (
                            <Form.Label>
                                <strong>Status:</strong>
                                <span>{` ${progressMessage}`}</span>
                            </Form.Label>
                        )}
                        {progress !== undefined && (
                            <ProgressBar
                                now={progress}
                                style={{ height: '4px' }}
                            />
                        )}
                    </Group>
                </Dialog.Body>
                <Dialog.Footer>
                    <DialogButton
                        onClick={() => onOk(true)}
                        disabled={isInProgress}
                        variant="primary"
                    >
                        Program
                    </DialogButton>
                    <DialogButton
                        onClick={() => onOk(false)}
                        disabled={isInProgress}
                    >
                        No
                    </DialogButton>
                </Dialog.Footer>
            </Dialog>
        );
    }
}
