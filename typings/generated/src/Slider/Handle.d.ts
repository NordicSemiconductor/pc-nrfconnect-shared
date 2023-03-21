import { FC } from 'react';
import { RangeOrValues } from './range';
import './handle.scss';
interface Props {
    value: number;
    disabled: boolean;
    range: RangeOrValues;
    onChange: (number: number) => void;
    onChangeComplete?: () => void;
    sliderWidth?: number;
}
declare const Handle: FC<Props>;
export default Handle;
