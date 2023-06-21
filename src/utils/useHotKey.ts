/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { DependencyList, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { addShortcut, removeShortcut, Shortcut } from '../About/shortcutSlice';
import { sendUsageData } from './usageData';

const useNewHotKey = (shortcut: Shortcut, deps: DependencyList = []) => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(addShortcut(shortcut));

        const combos = Array.isArray(shortcut.hotKey)
            ? shortcut.hotKey
            : [shortcut.hotKey];

        const event = createHotKeyHandler(combos, shortcut);
        document.addEventListener('keydown', event);

        return () => {
            dispatch(removeShortcut(shortcut));
            document.removeEventListener('keydown', event);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
};
const useLegacyHotKey = (hotKey: string | string[], action: () => void) => {
    console.warn(
        `Defining a hot key for '${hotKey}' using a legacy API. ` +
            'Please update the app (or tell the app author to update it to ' +
            'the latest API).'
    );

    useNewHotKey({
        hotKey,
        title: 'Legacy shortcut',
        isGlobal: false,
        action,
    });
};

const isUsingLegacyHotkey = (
    args: unknown[]
): args is Parameters<typeof useLegacyHotKey> =>
    args.length === 2 && typeof args[1] === 'function';

export default (
    ...args:
        | Parameters<typeof useNewHotKey>
        | Parameters<typeof useLegacyHotKey>
) => {
    if (isUsingLegacyHotkey(args)) {
        useLegacyHotKey(...args);
    } else {
        useNewHotKey(...args);
    }
};

const modifiers = ['ctrl', 'alt', 'meta', 'shift', 'mod'];
const createHotKeyHandler =
    (combos: string[], shortcut: Shortcut) =>
    (keyboardEvent: KeyboardEvent) => {
        const { altKey, ctrlKey, metaKey, shiftKey, key } = keyboardEvent;

        combos.forEach(combo => {
            const parts = combo.split('+');
            const nonModifierKey = parts.find(
                part => !modifiers.includes(part)
            );

            parts.includes('mod'); // ctrl | meta

            const ctrl =
                parts.includes('ctrl') ||
                (process.platform !== 'darwin' && parts.includes('mod'));

            const meta =
                parts.includes('meta') ||
                (process.platform === 'darwin' && parts.includes('mod'));

            if (
                ctrlKey === ctrl &&
                metaKey === meta &&
                altKey === parts.includes('alt') &&
                shiftKey === parts.includes('shift') &&
                key === nonModifierKey
            ) {
                shortcut.action();
                sendUsageData('Pressed hotkey', combo);
            }
        });
    };
