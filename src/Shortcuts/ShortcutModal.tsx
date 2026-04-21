/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useMemo } from 'react';
import Modal from 'react-bootstrap/Modal';
import { useSelector } from 'react-redux';

import { type Shortcut, shortcutsSelector } from '../About/shortcutSlice';
import ShortcutItem from './ShortcutItem';

import './Shortcut-modal.scss';

const sortedShortcuts = (shortcuts: Iterable<Shortcut>, global: boolean) =>
    Array.from(shortcuts)
        .filter(shortcut => shortcut.isGlobal === global)
        .sort((s1, s2) => s1.title.localeCompare(s2.title));

export interface Props {
    isVisible: boolean;
    onCancel: () => void;
}

const ShortcutModal: React.FC<Props> = ({ isVisible, onCancel }) => {
    const shortcuts = useSelector(shortcutsSelector);
    const local = useMemo(() => sortedShortcuts(shortcuts, false), [shortcuts]);
    const global = useMemo(() => sortedShortcuts(shortcuts, true), [shortcuts]);

    return (
        <Modal
            show={isVisible}
            onHide={onCancel}
            size="lg"
            className="shortcut-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    <h3>Shortcuts</h3>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="shortcut-lists">
                <>
                    {local.length > 0 && (
                        <div>
                            <h4 className="list-header">In this app</h4>
                            {local.map(shortcut => (
                                <ShortcutItem
                                    key={shortcut.title}
                                    title={shortcut.title}
                                    hotKey={shortcut.hotKey}
                                />
                            ))}
                        </div>
                    )}
                    <div>
                        <h4 className="list-header">In all apps</h4>
                        {global.map(shortcut => (
                            <ShortcutItem
                                key={shortcut.title}
                                title={shortcut.title}
                                hotKey={shortcut.hotKey}
                            />
                        ))}
                    </div>
                </>
            </Modal.Body>
        </Modal>
    );
};

export default ShortcutModal;
