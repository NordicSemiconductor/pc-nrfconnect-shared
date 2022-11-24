/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

import './state-selector.scss';

export interface Props {
    items: string[];
    onSelect: (index: number) => void;
    disabled?: boolean;
    selectedItem: string;
}

const StateSelector: FC<Props> = ({
    items,
    onSelect,
    disabled = false,
    selectedItem,
}) => {
    const selectionButton = (item: string, index: number) => (
        <Button
            key={item}
            variant={selectedItem === item ? 'set' : 'unset'}
            onClick={() => {
                onSelect(index);
            }}
            active={selectedItem === item}
            disabled={disabled}
        >
            {item}
        </Button>
    );

    return (
        <ButtonGroup className="w-100 d-flex flex-row channel-selection">
            {items.map((item, index) => selectionButton(item, index))}
        </ButtonGroup>
    );
};

export default StateSelector;
