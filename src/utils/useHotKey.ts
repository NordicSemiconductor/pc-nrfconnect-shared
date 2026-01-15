/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type DependencyList, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Mousetrap from 'mousetrap';

import {
    addShortcut,
    removeShortcut,
    type Shortcut,
} from '../About/shortcutSlice';
import telemetry from '../telemetry/telemetry';

const useNewHotKey = (shortcut: Shortcut, deps: DependencyList = []) => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(addShortcut(shortcut));

        Mousetrap.bind(shortcut.hotKey, (_e, combo) => {
            shortcut.action();
            telemetry.sendEvent('pressed hotkey', { combo });
        });

        return () => {
            dispatch(removeShortcut(shortcut));

            Mousetrap.unbind(shortcut.hotKey);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
};
const useLegacyHotKey = (hotKey: string | string[], action: () => void) => {
    console.warn(
        `Defining a hot key for '${hotKey}' using a legacy API. ` +
            'Please update the app (or tell the app author to update it to ' +
            'the latest API).',
    );

    useNewHotKey({
        hotKey,
        title: 'Legacy shortcut',
        isGlobal: false,
        action,
    });
};

const isUsingLegacyHotkey = (
    args: unknown[],
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
