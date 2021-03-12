/* Copyright (c) 2015 - 2021, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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

const FactoryResetButton = ({ resetFn, label, modalText }) => {
    const [isFactoryResetting, setIsFactoryResetting] = useState(false);

    const defaultResetFn = () => {
        store().clear();
        setIsFactoryResetting(false);
        logger.info('Successfully restored defaults');
    };

    return (
        <>
            <Button
                variant="secondary"
                onClick={() => setIsFactoryResetting(true)}
                className="w-100"
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
};

export default FactoryResetButton;
