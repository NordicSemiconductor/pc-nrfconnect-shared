/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useState } from 'react';
import { string } from 'prop-types';

import Button from '../Button/Button';
import ShortcutModal from '../Shortcuts/ShortcutModal';
import { useHotkey } from '../Shortcuts/useHotkey';

interface Props {
    label: string;
}

const ShortcutButton: FC<Props> = ({ label }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const toggleModalVisible = () => setIsModalVisible(!isModalVisible);

    useHotkey({
        hotKey: '?',
        title: 'Open/close this hotkey menu',
        isGlobal: true,
        action: () => toggleModalVisible(),
    });

    return (
        <>
            <Button onClick={toggleModalVisible}>{label}</Button>
            <ShortcutModal
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
