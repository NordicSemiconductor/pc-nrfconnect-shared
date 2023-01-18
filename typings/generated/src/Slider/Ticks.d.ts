import { FC } from 'react';
import { RangeOrValues } from './range';
import './ticks.scss';
interface Props {
    range: RangeOrValues;
    valueRange: {
        min: number;
        max: number;
    };
}
declare const Ticks: FC<Props>;
export default Ticks;
