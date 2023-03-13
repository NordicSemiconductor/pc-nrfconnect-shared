import { FC } from 'react';
import './steppers.scss';
export declare type Step = {
    title: string;
    caption?: string;
    active?: boolean;
    success?: boolean;
    warn?: boolean;
    fail?: boolean;
};
export interface Props {
    title?: string;
    steps: Step[];
}
declare const Steppers: FC<Props>;
export default Steppers;
