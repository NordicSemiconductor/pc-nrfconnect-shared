import { FC, ReactNode } from 'react';
import { Device } from '../../../state';
export declare const AnimatedList: FC<{
    children: ReactNode;
    devices: Device[];
}>;
export declare const AnimatedItem: FC<{
    itemKey: string;
    children: ReactNode;
}>;
