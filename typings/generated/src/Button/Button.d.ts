import React from 'react';
declare type ButtonProps = {
    id?: string;
    className?: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
    title?: string;
    large?: boolean;
};
declare const Button: React.FC<ButtonProps>;
export default Button;
