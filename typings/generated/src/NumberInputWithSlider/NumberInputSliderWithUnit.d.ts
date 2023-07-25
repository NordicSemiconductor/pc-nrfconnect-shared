import React from 'react';
import { RangeOrValues } from '../Slider/range';
declare const _default: ({ disabled, range, value, onChange, onChangeComplete, label, unit, }: {
    disabled: boolean;
    range: RangeOrValues;
    value: number;
    onChange: (value: number) => void;
    onChangeComplete?: ((value: number) => void) | undefined;
    label?: React.ReactNode;
    unit?: React.ReactNode;
}) => JSX.Element;
export default _default;
