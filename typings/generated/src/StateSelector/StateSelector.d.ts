import { FC } from 'react';
import './state-selector.scss';
export interface Props {
    items: string[];
    onSelect: (index: number) => void;
    disabled?: boolean;
    selectedItem: string;
}
declare const StateSelector: FC<Props>;
export default StateSelector;
