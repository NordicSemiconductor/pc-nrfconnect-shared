import React, { useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { arrayOf, bool, func, number, string } from 'prop-types';

const StateSelector = ({ items, defaultIndex, onSelect, disabled }) => {
    const [selected, setSelected] = useState(items[defaultIndex] ?? items[0]);

    const selectionButton = (item, index) => (
        <Button
            variant={selected === item ? 'set' : 'unset'}
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
    items: arrayOf(string).isRequired,
    defaultIndex: number,
    onSelect: func.isRequired,
    disabled: bool,
};

export default StateSelector;
