import { FC, ReactNode } from 'react';
import { ButtonVariants } from '../Button/Button';
import './start-stop-button.scss';
interface Props {
    startText?: ReactNode;
    stopText?: ReactNode;
    onClick: () => void;
    started: boolean;
    disabled?: boolean;
    large?: boolean;
    showIcon?: boolean;
    variant?: ButtonVariants;
    className?: string;
}
declare const StartStopButton: FC<Props>;
export default StartStopButton;
