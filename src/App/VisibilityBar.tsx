/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

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
    setLogVisible,
    toggleSidePanelVisible,
} from './appLayout';

import './visibility-bar.scss';

export default ({ isSidePanelEnabled }: { isSidePanelEnabled: boolean }) => {
    const dispatch = useDispatch();
    const isSidePanelVisible = useSelector(isSidePanelVisibleSelector);
    const isLogVisible = useSelector(isLogVisibleSelector);
    const autoScroll = useSelector(autoScrollSelector);

    useHotKey({
        hotKey: ['ctrl+p', 'ctrl+n'],
        title: 'Show side panel',
        isGlobal: true,
        action: () => dispatch(toggleSidePanelVisible()),
    });

    useHotKey({
        hotKey: 'ctrl+d',
        title: 'Clear log',
        isGlobal: true,
        action: () => dispatch(clear()),
    });

    useHotKey(
        {
            hotKey: 'ctrl+l',
            title: 'Show log',
            isGlobal: true,
            action: () => dispatch(setLogVisible(!isLogVisible)),
        },
        [isLogVisible],
    );

    return (
        <div className="core19-visibility-bar">
            {isSidePanelEnabled && (
                <div className="core19-visibility-bar-show-side-panel">
                    <Toggle
                        id="visibility-bar-show-side-panel"
                        label="Show side panel"
                        title="ctrl+p or ctr+n"
                        onToggle={() => dispatch(toggleSidePanelVisible())}
                        isToggled={isSidePanelVisible}
                        variant="primary"
                    />
                </div>
            )}
            <div className="core19-visibility-bar-show-log">
                <button
                    type="button"
                    title="ctrl+d"
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
                    title="ctrl+l"
                    onToggle={() => dispatch(setLogVisible(!isLogVisible))}
                    isToggled={isLogVisible}
                    variant="secondary"
                />
            </div>
        </div>
    );
};
