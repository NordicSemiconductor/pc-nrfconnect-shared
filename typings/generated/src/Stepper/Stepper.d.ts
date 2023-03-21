/// <reference types="react" />
import './steppers.scss';
declare type StepAction = StepString & {
    action: () => void;
};
declare type StepTooltip = StepString & {
    tooltip: string;
};
declare type StepString = {
    id?: string;
    caption: string;
};
declare type StepState = 'active' | 'success' | 'warning' | 'failure';
declare type StepCaption = StepString | StepAction | StepTooltip;
export declare type Step = {
    id?: string;
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
