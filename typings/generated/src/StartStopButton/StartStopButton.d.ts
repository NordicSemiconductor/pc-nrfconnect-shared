import { FC, ReactNode } from 'react';
import { ButtonVariants } from '../Button/Button';
import './start-stop-button.scss';
interface Props {
    startText?: ReactNode | string;
    stopText?: ReactNode | string;
    onClick: () => void;
    started: boolean;
    disabled?: boolean;
    large?: boolean;
    variant?: ButtonVariants;
    className?: string;
    showIcon?: boolean;
}
declare const StartStopButton: FC<Props>;
export default StartStopButton;
