import React from 'react';
import './state-selector.scss';
interface ComplexItem {
    key: string;
    renderItem: React.ReactNode;
}
type SelectItem = string | ComplexItem;
export interface Props {
    items: SelectItem[];
    onSelect: (index: number) => void;
    disabled?: boolean;
    selectedItem: SelectItem;
}
declare const _default: ({ items, onSelect, disabled, selectedItem }: Props) => JSX.Element;
export default _default;
//# sourceMappingURL=StateSelector.d.ts.map