/// <reference types="react" />
import './stepper.scss';
declare type ActionCaption = StringCaption & {
    action: () => void;
};
declare type TooltipCaption = StringCaption & {
    tooltip: string;
};
declare type StringCaption = {
    id: string;
    caption: string;
};
declare type StepState = 'active' | 'success' | 'warning' | 'failure';
declare type StepCaption = StringCaption | ActionCaption | TooltipCaption;
export declare type Step = {
    id: string;
    title: string;
    caption?: string | (StepCaption | StepCaption[]);
    state?: StepState;
};
export interface Steppers {
    title?: string;
    steps: Step[];
}
declare const _default: ({ title, steps }: Steppers) => JSX.Element;
export default _default;
