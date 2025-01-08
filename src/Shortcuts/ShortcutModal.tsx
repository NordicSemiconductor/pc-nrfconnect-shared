/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { useSelector } from 'react-redux';

import { globalShortcuts, localShortcuts } from '../About/shortcutSlice';
import { DialogButton, GenericDialog as Dialog } from '../Dialog/Dialog';
import ShortcutItem from './ShortcutItem';

export interface Props {
    isVisible: boolean;
    onCancel: () => void;
}

const ShortcutModal: FC<Props> = ({ isVisible, onCancel }) => {
    const local = useSelector(localShortcuts);
    const global = useSelector(globalShortcuts);

    return (
        <Dialog
            title="Shortcuts"
            closeOnEsc
            isVisible={isVisible}
            onHide={onCancel}
            size="m"
            footer={<DialogButton onClick={onCancel}>Close</DialogButton>}
        >
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
        </Dialog>
    );
};

export default ShortcutModal;
