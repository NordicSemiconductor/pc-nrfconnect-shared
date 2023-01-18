import React from 'react';
export interface DropdownItem {
    label: string;
    value: string;
}
export interface DropdownProps {
    label?: string;
    items: DropdownItem[];
    onSelect: (item: DropdownItem) => void;
    disabled?: boolean;
    selectedItem: DropdownItem;
    numItemsBeforeScroll?: number;
}
declare const Dropdown: React.FC<DropdownProps>;
export default Dropdown;
