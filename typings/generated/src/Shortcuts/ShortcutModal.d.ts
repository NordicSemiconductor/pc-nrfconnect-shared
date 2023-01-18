import { FC } from 'react';
import './Shortcut-modal.scss';
export interface Props {
    isVisible: boolean;
    onCancel: () => void;
}
declare const ShortcutModal: FC<Props>;
export default ShortcutModal;
