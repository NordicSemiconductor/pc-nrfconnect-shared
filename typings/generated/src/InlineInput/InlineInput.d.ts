import React from 'react';
import './inline-input.scss';
interface Props {
    disabled?: boolean;
    value: string;
    isValid?: (value: string) => boolean;
    onChange: (value: string) => void;
    onChangeComplete?: (value: string) => void;
    onKeyboardIncrementAction?: () => string;
    onKeyboardDecrementAction?: () => string;
    className?: string;
}
declare const InlineInput: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLInputElement>>;
export default InlineInput;
