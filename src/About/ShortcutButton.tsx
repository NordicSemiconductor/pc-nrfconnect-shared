/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useState } from 'react';
import { string } from 'prop-types';

import Button from '../Button/Button';
import ShortcutModal from '../Shortcuts/ShortcutModal';
import { Shortcut, shortcuts, useHotkey } from '../Shortcuts/useHotkey';

interface Props {
    label: string;
}

const ShortcutButton: FC<Props> = ({ label }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const toggleModalVisible = () => setIsModalVisible(!isModalVisible);

    const localshortcuts: Shortcut[] = [];

    // Global hotkey for bringing up the hotkey menu
    useHotkey({
        hotKey: '?',
        title: 'Shortcuts',
        description: 'Opens/closes this hotkey menu',
        isGlobal: true, // True, as this hotkey is defined in shared
        action: () => toggleModalVisible(),
    });

    // Test shortcut only to show UI
    const sc2 = {
        hotKey: 'alt+i',
        title: 'Test title',
        description: 'test description',
        isGlobal: true,
        action: () => console.log('test'), // Unbound, won't fire
    };

    localshortcuts.push(sc2);
    return (
        <>
            <Button onClick={toggleModalVisible}>{label}</Button>
            <ShortcutModal
                globalShortcutList={shortcuts.filter(s => s.isGlobal === true)}
                localShortcutList={shortcuts.filter(s => s.isGlobal === false)}
                isVisible={isModalVisible}
                onCancel={toggleModalVisible}
            />
        </>
    );
};

ShortcutButton.propTypes = {
    label: string.isRequired,
};

export default ShortcutButton;
