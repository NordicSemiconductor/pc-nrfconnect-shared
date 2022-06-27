/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import Card from 'react-bootstrap/Card';
import { string } from 'prop-types';

import './Shortcut-item.scss';

export interface Props {
    title: string;
    hotKey: string;
    description: string;
}

const ShortcutItem: FC<Props> = ({ title, hotKey, description }) => {
    const shortcutKeys: string[] = hotKey.split('+');
    return (
        <Card className="shortcut-item">
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <Card.Text>
                    {shortcutKeys.map(shortcutKey => (
                        <span key={shortcutKey}>
                            <span className="shortcut-span">{shortcutKey}</span>
                            {shortcutKey !==
                                shortcutKeys[shortcutKeys.length - 1] && (
                                <span className="separator-span">+</span>
                            )}
                        </span>
                    ))}
                </Card.Text>
                <Card.Text>{description}</Card.Text>
            </Card.Body>
        </Card>
    );
};

ShortcutItem.propTypes = {
    title: string.isRequired,
    hotKey: string.isRequired,
    description: string.isRequired,
};

export default ShortcutItem;
