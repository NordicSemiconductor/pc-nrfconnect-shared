/// <reference types="react" />
import './steppers.scss';
export declare type StepState = 'active' | 'success' | 'warning' | 'failure';
export declare type Step = {
    title: string;
    caption?: string;
    state?: StepState;
};
export interface Steppers {
    title?: string;
    steps: Step[];
}
declare const Steppers: ({ title, steps }: Steppers) => JSX.Element;
export default Steppers;
