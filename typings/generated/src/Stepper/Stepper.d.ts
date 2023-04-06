/// <reference types="react" />
import './stepper.scss';
type ActionCaption = StringCaption & {
    action: () => void;
};
type TooltipCaption = StringCaption & {
    tooltip: string;
};
type StringCaption = {
    id: string;
    caption: string;
};
type StepState = 'active' | 'success' | 'warning' | 'failure';
type StepCaption = StringCaption | ActionCaption | TooltipCaption;
export type Step = {
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
