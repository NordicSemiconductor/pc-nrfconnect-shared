import { FC } from 'react';
import { ButtonVariants } from '../Button/Button';
interface Props {
    resetFn?: () => void;
    label: string;
    modalText?: string;
    variant?: ButtonVariants;
    classNames?: string;
}
declare const FactoryResetButton: FC<Props>;
export default FactoryResetButton;
