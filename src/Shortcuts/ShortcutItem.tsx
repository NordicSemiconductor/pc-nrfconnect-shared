/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { type FC } from 'react';

import './Shortcut-item.scss';

export interface Props {
    title: string;
    hotKey: string[] | string;
}

const ShortcutItem: FC<Props> = ({ title, hotKey }) => {
    const shortcutComboKeys: string[][] = !Array.isArray(hotKey)
        ? [hotKey.split('+')]
        : hotKey.map(element => element.split('+'));

    return (
        <div className="shortcut-item">
            <h5 className="shortcut-title">{title}</h5>
            <div className="shortcuts">
                {shortcutComboKeys.map(shortcutKeys => (
                    <div
                        key={shortcutKeys.toString()}
                        className="shortcut-element"
                    >
                        {shortcutKeys.map(shortcutKey => (
                            <span key={shortcutKey}>
                                <span className="shortcut-span">
                                    {shortcutKey}
                                </span>
                                {shortcutKey !==
                                    shortcutKeys[shortcutKeys.length - 1] && (
                                    <span className="separator-span">+</span>
                                )}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShortcutItem;
