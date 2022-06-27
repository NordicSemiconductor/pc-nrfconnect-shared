/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import Modal from 'react-bootstrap/Modal';
import { bool, func } from 'prop-types';

import ShortcutItem from './ShortcutItem';
import { shortcuts } from './useHotkey';

import './Shortcut-modal.scss';

export interface Props {
    isVisible: boolean;
    onCancel: () => void;
}

const ShortcutModal: FC<Props> = ({ isVisible, onCancel }) => (
    <Modal show={isVisible} onHide={onCancel} className="shortcut-modal">
        <Modal.Header closeButton>
            <Modal.Title>
                <h3>Shortcuts</h3>
            </Modal.Title>
        </Modal.Header>
        <Modal.Body className="shortcut-lists">
            <div>
                <h4>In this app</h4>
                {shortcuts
                    .filter(shortcut => shortcut.isGlobal === false)
                    .map(shortcut => (
                        <ShortcutItem
                            key={shortcut.hotKey}
                            title={shortcut.title}
                            hotKey={shortcut.hotKey}
                            description={shortcut.description}
                        />
                    ))}
            </div>
            <div>
                <h4>In all apps</h4>
                {shortcuts
                    .filter(shortcut => shortcut.isGlobal === true)
                    .map(shortcut => (
                        <ShortcutItem
                            key={shortcut.hotKey}
                            title={shortcut.title}
                            hotKey={shortcut.hotKey}
                            description={shortcut.description}
                        />
                    ))}
            </div>
        </Modal.Body>
    </Modal>
);

ShortcutModal.propTypes = {
    isVisible: bool.isRequired,
    onCancel: func.isRequired,
};

export default ShortcutModal;
