/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useRef, useState } from 'react';

import Button, { ButtonVariants } from '../Button/Button';
import { Dialog, DialogButton } from '../Dialog/Dialog';
import logger from '../logging';
import { getAppSpecificStore as store } from '../utils/persistentStore';

interface Props {
    resetFn?: () => void;
    label: string;
    modalText?: string;
    variant?: ButtonVariants;
    classNames?: string;
    large?: boolean;
}

const DEFAULT_MODAL_TEXT =
    'By restoring defaults, all stored app-specific configuration values will be lost. This does not include configurations such as device renames and favorites. Are you sure you want to proceed?';

const FactoryResetButton: FC<Props> = ({
    resetFn,
    label,
    modalText,
    variant = 'secondary',
    classNames,
    large = false,
}) => {
    const [showDialog, setShowDialog] = useState(false);
    useRef(); // showdialog
    const defaultResetFn = () => {
        store().clear();
        logger.info('Successfully restored defaults');
    };

    return (
        <>
            <Button
                large={large}
                variant={variant}
                onClick={() => setShowDialog(true)}
                className={classNames}
            >
                {label}
            </Button>
            <Dialog
                isVisible={showDialog}
                closeOnUnfocus
                onHide={() => setShowDialog(false)}
            >
                <Dialog.Header
                    title="Restore factory settings"
                    headerIcon="alert"
                />
                <Dialog.Body>{modalText || DEFAULT_MODAL_TEXT}</Dialog.Body>
                <Dialog.Footer>
                    <DialogButton
                        variant="danger"
                        onClick={() => {
                            if (resetFn) resetFn();
                            else defaultResetFn();
                            setShowDialog(false);
                        }}
                    >
                        Restore
                    </DialogButton>
                    <DialogButton onClick={() => setShowDialog(false)}>
                        Cancel
                    </DialogButton>
                </Dialog.Footer>
            </Dialog>
        </>
    );
};

export default FactoryResetButton;
