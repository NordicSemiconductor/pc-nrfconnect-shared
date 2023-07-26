import React from 'react';
export type ButtonVariants = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'link' | 'link-button';
type ButtonProps = {
    id?: string;
    variant: ButtonVariants;
    className?: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
    title?: string;
    large?: boolean;
};
declare const Button: React.FC<ButtonProps>;
export default Button;
