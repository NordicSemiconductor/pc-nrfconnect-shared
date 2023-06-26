import { FC, ReactNode } from 'react';
import './toggle.scss';
export interface Props {
    id?: string;
    title?: string;
    isToggled: boolean;
    onToggle?: (isToggled: boolean) => void;
    label?: ReactNode;
    labelRight?: boolean;
    variant?: 'primary' | 'secondary';
    barColor?: string;
    barColorToggled?: string;
    handleColor?: string;
    handleColorToggled?: string;
    width?: string;
    disabled?: boolean;
    children?: ReactNode;
}
export declare const Toggle: FC<Props>;
