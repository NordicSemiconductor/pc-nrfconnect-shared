import { FC } from 'react';
import './start-stop-button.scss';
interface Props {
    startText?: string;
    stopText?: string;
    onClick: () => void;
    started: boolean;
    disabled?: boolean;
    large?: boolean;
    className?: string;
}
declare const StartStopButton: FC<Props>;
export default StartStopButton;
