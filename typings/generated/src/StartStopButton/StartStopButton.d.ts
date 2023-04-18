import { FC } from 'react';
import { ButtonVariants } from '../Button/Button';
import './start-stop-button.scss';
interface Props {
    startText?: string;
    stopText?: string;
    onClick: () => void;
    started: boolean;
    disabled?: boolean;
    large?: boolean;
    variant?: ButtonVariants;
    className?: string;
}
declare const StartStopButton: FC<Props>;
export default StartStopButton;
