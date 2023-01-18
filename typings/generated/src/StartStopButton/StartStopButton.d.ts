import { FC } from 'react';
import './start-stop-button.scss';
interface Props {
    startText?: string;
    stopText?: string;
    onClick: () => void;
    disabled?: boolean;
}
declare const StartStopButton: FC<Props>;
export default StartStopButton;
