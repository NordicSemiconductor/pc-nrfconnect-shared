/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { func, string } from 'prop-types';

import ConfirmationDialog from '../Dialog/ConfirmationDialog';
import logger from '../logging';
import { getAppSpecificStore as store } from '../utils/persistentStore';

import './factory-reset-button.scss';

const DEFAULT_MODAL_TEXT =
    'By restoring defaults, all stored app-specific configuration values will be lost. This does not include configurations such as device renames and favorites. Are you sure you want to proceed?';

const FactoryResetButton = ({
    resetFn,
    label,
    modalText,
    variant,
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
                variant={variant || 'secondary'}
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
    variant: string,
    classNames: string,
};

export default FactoryResetButton;
