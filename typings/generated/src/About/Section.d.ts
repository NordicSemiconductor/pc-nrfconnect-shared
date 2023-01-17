import { FC, ReactNode } from 'react';
import './section.scss';
interface Props {
    title?: string;
    children?: ReactNode;
}
declare const Section: FC<Props>;
export default Section;
