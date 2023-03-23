/// <reference types="react" />
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
declare const _default: ({ label, items, onSelect, disabled, selectedItem, numItemsBeforeScroll, }: DropdownProps) => JSX.Element;
export default _default;
