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
    action: () => void;
}

export const shortcuts: Shortcut[] = [];

// Don't worry, we'll fix this name :)
export const useHotKey2 = (shortcut: Shortcut, deps?: DependencyList) => {
    // useEffect is only run once, unless dependencies are changed
    useEffect(() => {
        shortcuts.push(shortcut);

        Mousetrap.bind(shortcut.hotKey, shortcut.action);

        // Cleanup function removes item from shortcuts-array
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
