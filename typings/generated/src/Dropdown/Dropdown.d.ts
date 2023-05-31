import React from 'react';
export interface DropdownItem {
    label: React.ReactNode;
    value: string;
}
export interface DropdownProps {
    id?: string;
    label?: React.ReactNode;
    items: DropdownItem[];
    onSelect: (item: DropdownItem) => void;
    disabled?: boolean;
    selectedItem: DropdownItem;
    numItemsBeforeScroll?: number;
}
declare const _default: ({ id, label, items, onSelect, disabled, selectedItem, numItemsBeforeScroll, }: DropdownProps) => JSX.Element;
export default _default;
