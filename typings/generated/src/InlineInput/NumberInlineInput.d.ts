import { FC } from 'react';
import { RangeOrValues } from '../Slider/range';
import './number-inline-input.scss';
export interface Props {
    disabled?: boolean;
    value: number;
    range: RangeOrValues;
    onChange: (value: number) => void;
    onChangeComplete?: (value: number) => void;
}
declare const NumberInlineInput: FC<Props>;
export default NumberInlineInput;
//# sourceMappingURL=NumberInlineInput.d.ts.map