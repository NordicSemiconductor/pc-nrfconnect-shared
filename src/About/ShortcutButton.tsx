/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useState } from 'react';

import Button from '../Button/Button';
import ShortcutModal from '../Shortcuts/ShortcutModal';
import useHotKey from '../utils/useHotKey';

interface Props {
    label: string;
}

const ShortcutButton: FC<Props> = ({ label }) => {
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
            <Button onClick={toggleModalVisible}>{label}</Button>
            <ShortcutModal
                isVisible={isModalVisible}
                onCancel={toggleModalVisible}
            />
        </>
    );
};

export default ShortcutButton;
