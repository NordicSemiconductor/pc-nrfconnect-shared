/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { DependencyList, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Mousetrap from 'mousetrap';

import { addShortcut, removeShortcut, Shortcut } from '../About/shortcutSlice';
import { sendUsageData } from './usageData';

export default (shortcut: Shortcut, deps?: DependencyList) => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(addShortcut(shortcut));

        Mousetrap.bind(shortcut.hotKey, (_e, combo) => {
            shortcut.action();
            sendUsageData('Pressed hotkey', combo);
        });

        return () => {
            dispatch(removeShortcut(shortcut));

            Mousetrap.unbind(shortcut.hotKey);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
};
