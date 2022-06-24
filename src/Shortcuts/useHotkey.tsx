/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { DependencyList, useEffect } from 'react';
import Mousetrap from 'mousetrap';

export interface Shortcut {
    hotKey: string;
    title: string;
    description: string;
    isGlobal: boolean;
    action: () => void;
}

export const shortcuts: Shortcut[] = [];

export const useHotkey = (shortcut: Shortcut, deps?: DependencyList) => {
    useEffect(() => {
        shortcuts.push(shortcut);

        Mousetrap.bind(shortcut.hotKey, shortcut.action);

        return () => {
            shortcuts.splice(
                shortcuts.findIndex(
                    shortcutItem => shortcutItem.hotKey === shortcut.hotKey
                ),
                1
            );

            Mousetrap.unbind(shortcut.hotKey);
        };
    }, [deps, shortcut]); // Sould this not just be "}, deps);"?
};
