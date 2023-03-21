/// <reference types="react" />
import './stepper.scss';
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
    caption?: string | (StepCaption | StepCaption[]);
    state?: StepState;
};
export interface Steppers {
    title?: string;
    steps: Step[];
}
declare const Steppers: ({ title, steps }: Steppers) => JSX.Element;
export default Steppers;
