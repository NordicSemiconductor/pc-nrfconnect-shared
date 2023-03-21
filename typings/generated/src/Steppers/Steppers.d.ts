/// <reference types="react" />
import './steppers.scss';
declare type StepAction = {
    caption: string;
    action: () => void;
};
declare type StepTooltip = {
    caption: string;
    tooltip: string;
};
declare type StepState = 'active' | 'success' | 'warning' | 'failure';
declare type StepCaption = string | StepAction | StepTooltip;
export declare type Step = {
    title: string;
    caption?: StepCaption | StepCaption[];
    state?: StepState;
};
export interface Steppers {
    title?: string;
    steps: Step[];
}
declare const Steppers: ({ title, steps }: Steppers) => JSX.Element;
export default Steppers;
