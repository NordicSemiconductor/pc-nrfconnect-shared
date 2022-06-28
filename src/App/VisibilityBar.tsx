/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { bool } from 'prop-types';

import {
    autoScroll as autoScrollSelector,
    clear,
    toggleAutoScroll,
} from '../Log/logSlice';
import logger from '../logging';
import { useHotkey } from '../Shortcuts/useHotkey';
import { Toggle } from '../Toggle/Toggle';
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

    useHotkey({
        hotKey: 'shift+m',
        title: 'Show/Hide menu',
        description: 'Shows/Hides the menu',
        isGlobal: true,
        action: () => dispatch(toggleSidePanelVisible()),
    });

    useHotkey({
        hotKey: 'shift+r',
        title: 'Clear log',
        description: 'Clears the log',
        isGlobal: true,
        action: () => dispatch(clear()),
    });

    useHotkey({
        hotKey: 'shift+o',
        title: 'Open log file',
        description: 'Opens the log file',
        isGlobal: true,
        action: () => logger.openLogFile(),
    });

    useHotkey({
        hotKey: 'shift+a',
        title: 'Autoscroll log',
        description: 'Autoscroll log',
        isGlobal: true,
        action: () => dispatch(toggleAutoScroll()),
    });

    useHotkey({
        hotKey: 'shift+s',
        title: 'Show log',
        description: 'Show log',
        isGlobal: true,
        action: () => dispatch(toggleLogVisible()),
    });

    return (
        <div className="core19-visibility-bar">
            {isSidePanelEnabled && (
                <div className="core19-visibility-bar-show-side-panel">
                    <Toggle
                        id="visibility-bar-show-side-panel"
                        label="Show menu"
                        onToggle={() => dispatch(toggleSidePanelVisible())}
                        isToggled={isSidePanelVisible}
                        variant="primary"
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
                <Toggle
                    id="autoscroll-log"
                    label="Autoscroll log"
                    onToggle={() => dispatch(toggleAutoScroll())}
                    isToggled={autoScroll}
                    variant="secondary"
                />
                <Toggle
                    id="visibility-bar-show-log"
                    label="Show log"
                    onToggle={() => dispatch(toggleLogVisible())}
                    isToggled={isLogVisible}
                    variant="secondary"
                />
            </div>
        </div>
    );
};

VisibilityBar.propTypes = {
    isSidePanelEnabled: bool.isRequired,
};

export default VisibilityBar;
