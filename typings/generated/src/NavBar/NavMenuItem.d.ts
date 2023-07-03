import { FC } from 'react';
import './nav-menu-item.scss';
interface Props {
    index: number;
    isSelected: boolean;
    label: string;
}
declare const NavMenuItem: FC<Props>;
export default NavMenuItem;
