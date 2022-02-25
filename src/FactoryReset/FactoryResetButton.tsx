/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useState } from 'react';
import { func, string } from 'prop-types';

import Button from '../Button/Button';
import ConfirmationDialog from '../Dialog/ConfirmationDialog';
import logger from '../logging';
import { getAppSpecificStore as store } from '../utils/persistentStore';

import './factory-reset-button.scss';

interface Props {
    resetFn?: () => void;
    label: string;
    modalText?: string;
    classNames?: string;
}

const DEFAULT_MODAL_TEXT =
    'By restoring defaults, all stored app-specific configuration values will be lost. This does not include configurations such as device renames and favorites. Are you sure you want to proceed?';

const FactoryResetButton: FC<Props> = ({
    resetFn,
    label,
    modalText,
    classNames,
}) => {
    const [isFactoryResetting, setIsFactoryResetting] = useState(false);

    const defaultResetFn = () => {
        store().clear();
        setIsFactoryResetting(false);
        logger.info('Successfully restored defaults');
    };

    return (
        <>
            <Button
                onClick={() => setIsFactoryResetting(true)}
                className={classNames}
            >
                {label}
            </Button>
            <ConfirmationDialog
                isVisible={isFactoryResetting}
                okButtonClassName="restore-btn"
                okButtonText="Restore"
                onOk={resetFn || defaultResetFn}
                onCancel={() => setIsFactoryResetting(false)}
            >
                {modalText || DEFAULT_MODAL_TEXT}
            </ConfirmationDialog>
        </>
    );
};

FactoryResetButton.propTypes = {
    resetFn: func,
    label: string.isRequired,
    modalText: string,
    classNames: string,
};

export default FactoryResetButton;
