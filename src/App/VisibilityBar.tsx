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
import { Toggle } from '../Toggle/Toggle';
import useHotKey from '../utils/useHotKey';
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

    useHotKey({
        hotKey: 'shift+m',
        title: 'Show/Hide menu',
        isGlobal: true,
        action: () => dispatch(toggleSidePanelVisible()),
    });

    useHotKey({
        hotKey: 'shift+r',
        title: 'Clear log',
        isGlobal: true,
        action: () => dispatch(clear()),
    });

    useHotKey({
        hotKey: 'shift+o',
        title: 'Open log file',
        isGlobal: true,
        action: () => logger.openLogFile(),
    });

    useHotKey({
        hotKey: 'shift+a',
        title: 'Autoscroll log',
        isGlobal: true,
        action: () => dispatch(toggleAutoScroll()),
    });

    useHotKey({
        hotKey: 'shift+l',
        title: 'Show log',
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
                        title="shift+m"
                        onToggle={() => dispatch(toggleSidePanelVisible())}
                        isToggled={isSidePanelVisible}
                        variant="primary"
                    />
                </div>
            )}
            <div className="core19-visibility-bar-show-log">
                <button
                    type="button"
                    title="shift+l"
                    className="log-button"
                    onClick={() => dispatch(clear())}
                >
                    Clear log
                </button>
                <button
                    type="button"
                    title="shift+o"
                    className="log-button"
                    onClick={logger.openLogFile}
                >
                    Open log file
                </button>
                <div className="flex-grow-1" />
                <Toggle
                    id="autoscroll-log"
                    label="Autoscroll log"
                    title="shift+a"
                    onToggle={() => dispatch(toggleAutoScroll())}
                    isToggled={autoScroll}
                    variant="secondary"
                />
                <Toggle
                    id="visibility-bar-show-log"
                    label="Show log"
                    title="shift+l"
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
