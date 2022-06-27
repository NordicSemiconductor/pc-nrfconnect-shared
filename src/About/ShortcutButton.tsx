/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useState } from 'react';
import { string } from 'prop-types';

import Button from '../Button/Button';
import ShortcutModal from '../Shortcuts/ShortcutModal';
import { shortcuts, useHotkey } from '../Shortcuts/useHotkey';

interface Props {
    label: string;
}

const ShortcutButton: FC<Props> = ({ label }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const toggleModalVisible = () => setIsModalVisible(!isModalVisible);

    useHotkey({
        hotKey: '?',
        title: 'Shortcuts',
        description: 'Opens/closes this hotkey menu',
        isGlobal: true,
        action: () => toggleModalVisible(),
    });

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
