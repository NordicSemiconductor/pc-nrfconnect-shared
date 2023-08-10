/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

import './state-selector.scss';

interface ComplexItem {
    key: string;
    renderItem: React.ReactNode;
}

type SelectItem = string | ComplexItem;

const convertToComplex = (item: SelectItem): ComplexItem => {
    if (typeof item === 'string') {
        return {
            key: item,
            renderItem: item,
        } as ComplexItem;
    }

    return item as ComplexItem;
};
export interface Props {
    items: SelectItem[];
    onSelect: (index: number) => void;
    disabled?: boolean;
    selectedItem: SelectItem;
}

export default ({ items, onSelect, disabled = false, selectedItem }: Props) => {
    const selectionButton = (item: SelectItem, index: number) => {
        const complexItem = convertToComplex(item);
        const complexSelectedItem = convertToComplex(selectedItem);
        return (
            <Button
                key={complexItem.key}
                variant={
                    complexSelectedItem.key === complexItem.key
                        ? 'set'
                        : 'unset'
                }
                onClick={() => {
                    onSelect(index);
                }}
                active={complexSelectedItem.key === complexItem.key}
                disabled={disabled}
            >
                {complexItem.renderItem}
            </Button>
        );
    };

    return (
        <ButtonGroup className="w-100 d-flex channel-selection flex-row">
            {items.map((item, index) => selectionButton(item, index))}
        </ButtonGroup>
    );
};
