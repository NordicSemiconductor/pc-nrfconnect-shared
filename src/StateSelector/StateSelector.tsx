/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { arrayOf, bool, func, number, string } from 'prop-types';

interface Props {
    items: string[];
    defaultIndex: number;
    onSelect: (index: number) => void;
    disabled?: boolean;
}

const StateSelector: FC<Props> = ({
    items,
    defaultIndex = 0,
    onSelect,
    disabled = false,
}) => {
    const [selected, setSelected] = useState(items[defaultIndex] ?? items[0]);

    const selectionButton = (item: string, index: number) => (
        <Button
            key={item}
            className={selected === item ? 'btn-set' : 'btn-unset'}
            onClick={() => {
                setSelected(item);
                onSelect(index);
            }}
            active={selected === item}
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

StateSelector.propTypes = {
    items: arrayOf(string.isRequired).isRequired,
    defaultIndex: number.isRequired,
    onSelect: func.isRequired,
    disabled: bool,
};

export default StateSelector;
