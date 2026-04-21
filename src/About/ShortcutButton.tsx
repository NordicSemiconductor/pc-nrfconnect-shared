/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';

import Button from '../Button/Button';
import ShortcutModal from '../Shortcuts/ShortcutModal';
import useHotKey from '../utils/useHotKey';

const ShortcutButton: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const toggleModalVisible = () => setIsModalVisible(!isModalVisible);

    useHotKey({
        hotKey: '?',
        title: 'Open shortcut overview',
        isGlobal: true,
        action: () => toggleModalVisible(),
    });

    return (
        <>
            <Button variant="secondary" onClick={toggleModalVisible}>
                {children}
            </Button>
            <ShortcutModal
                isVisible={isModalVisible}
                onCancel={toggleModalVisible}
            />
        </>
    );
};

export default ShortcutButton;
