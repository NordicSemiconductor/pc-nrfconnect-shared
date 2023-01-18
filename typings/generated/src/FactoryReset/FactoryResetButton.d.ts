import { FC } from 'react';
import { ButtonProps } from 'react-bootstrap';
import './factory-reset-button.scss';
interface Props {
    resetFn?: () => void;
    label: string;
    modalText?: string;
    variant?: ButtonProps['variant'];
    classNames?: string;
}
declare const FactoryResetButton: FC<Props>;
export default FactoryResetButton;
