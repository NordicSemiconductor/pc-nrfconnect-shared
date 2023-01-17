import { FC } from 'react';
import { RangeOrValues } from './range';
import './slider.scss';
export interface Props {
    id?: string;
    title?: string;
    disabled?: boolean;
    values: readonly number[];
    range: RangeOrValues;
    ticks?: boolean;
    onChange: ((v: number) => void)[];
    onChangeComplete?: () => void;
}
declare const Slider: FC<Props>;
export default Slider;
