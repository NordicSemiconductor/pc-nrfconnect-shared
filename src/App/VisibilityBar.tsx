/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import Form from 'react-bootstrap/Form';
import { useDispatch, useSelector } from 'react-redux';
import { bool } from 'prop-types';

import {
    autoScroll as autoScrollSelector,
    clear,
    toggleAutoScroll,
} from '../Log/logSlice';
import logger from '../logging';
import {
    isLogVisible as isLogVisibleSelector,
    isSidePanelVisible as isSidePanelVisibleSelector,
    toggleLogVisible,
    toggleSidePanelVisible,
} from './appLayout';

import './visibility-bar.scss';

const VisibilityBar: FC<{ isSidePanelEnabled: boolean }> = ({
    isSidePanelEnabled,
}) => {
    const dispatch = useDispatch();
    const isSidePanelVisible = useSelector(isSidePanelVisibleSelector);
    const isLogVisible = useSelector(isLogVisibleSelector);
    const autoScroll = useSelector(autoScrollSelector);

    return (
        <div className="core19-visibility-bar">
            {isSidePanelEnabled && (
                <div className="core19-visibility-bar-show-side-panel">
                    <Form.Switch
                        id="visibility-bar-show-side-panel"
                        label="Show side panel"
                        checked={isSidePanelVisible}
                        onChange={() => dispatch(toggleSidePanelVisible())}
                    />
                </div>
            )}
            <div className="core19-visibility-bar-show-log">
                <button
                    type="button"
                    className="log-button"
                    onClick={() => dispatch(clear())}
                >
                    Clear log
                </button>
                <button
                    type="button"
                    className="log-button"
                    onClick={logger.openLogFile}
                >
                    Open log file
                </button>
                <div className="flex-grow-1" />
                <Form.Switch
                    className="log-switch"
                    id="autoscroll-log"
                    label="Autoscroll log"
                    checked={autoScroll}
                    onChange={() => dispatch(toggleAutoScroll())}
                />
                <Form.Switch
                    className="log-switch"
                    id="visibility-bar-show-log"
                    label="Show log"
                    checked={isLogVisible}
                    onChange={() => dispatch(toggleLogVisible())}
                />
            </div>
        </div>
    );
};

VisibilityBar.propTypes = {
    isSidePanelEnabled: bool.isRequired,
};

export default VisibilityBar;
