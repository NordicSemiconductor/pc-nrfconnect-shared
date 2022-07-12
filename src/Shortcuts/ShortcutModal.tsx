/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import Modal from 'react-bootstrap/Modal';
import { useSelector } from 'react-redux';

import { globalShortcuts, localShortcuts } from '../About/shortcutSlice';
import ShortcutItem from './ShortcutItem';

import './Shortcut-modal.scss';

export interface Props {
    isVisible: boolean;
    onCancel: () => void;
}

const ShortcutModal: FC<Props> = ({ isVisible, onCancel }) => {
    const local = useSelector(localShortcuts);
    const global = useSelector(globalShortcuts);

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
            </Modal.Body>
        </Modal>
    );
};

export default ShortcutModal;
