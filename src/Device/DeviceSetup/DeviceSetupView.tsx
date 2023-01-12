/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Form from 'react-bootstrap/Form';

import { Dialog, DialogButton } from '../../Dialog/Dialog';

interface Props {
    isVisible: boolean;
    isInProgress: boolean;
    text?: string | null;
    choices: readonly string[];
    onOk: (choice: string | boolean) => void;
    onCancel: () => void;
}

interface State {
    selectedChoice: null | string;
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
export default class DeviceSetupDialog extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.onSelectChoice = this.onSelectChoice.bind(this);
        this.state = {
            selectedChoice: null,
        };
    }

    onSelectChoice(choice: string) {
        this.setState({ selectedChoice: choice });
    }

    render() {
        const { isVisible, isInProgress, text, choices, onOk, onCancel } =
            this.props;
        const { selectedChoice } = this.state;

        if (choices && choices.length > 0) {
            return (
                <Dialog isVisible={isVisible}>
                    <Dialog.Header title="Confirm" headerIcon="" />
                    <Dialog.Body>
                        <p>{text}</p>
                        <Form.Group>
                            {choices.map(choice => (
                                <Form.Check
                                    key={choice}
                                    name="radioGroup"
                                    type="radio"
                                    disabled={isInProgress}
                                    onClick={() => this.onSelectChoice(choice)}
                                    label={choice}
                                />
                            ))}
                        </Form.Group>
                    </Dialog.Body>
                    <Dialog.Footer showSpinner={isInProgress}>
                        <DialogButton
                            onClick={() => onOk(selectedChoice ?? false)}
                            disabled={!selectedChoice || isInProgress}
                        >
                            Ok
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
                <Dialog.Header title="Program device" headerIcon="" />
                <Dialog.Body>{text}</Dialog.Body>
                <Dialog.Footer showSpinner={isInProgress}>
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
                        Cancel
                    </DialogButton>
                </Dialog.Footer>
            </Dialog>
        );
    }
}
