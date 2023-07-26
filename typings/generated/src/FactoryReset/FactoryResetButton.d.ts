import { FC } from 'react';
import { ButtonVariants } from '../Button/Button';
interface Props {
    resetFn?: () => void;
    label: string;
    modalText?: string;
    variant?: ButtonVariants;
    classNames?: string;
    large?: boolean;
}
declare const FactoryResetButton: FC<Props>;
export default FactoryResetButton;
//# sourceMappingURL=FactoryResetButton.d.ts.map