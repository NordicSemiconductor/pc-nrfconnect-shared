/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, ReactNode } from 'react';
import { Flipped, Flipper, spring } from 'react-flip-toolkit';

import { Device } from '../../../state';

const changesOnReorder = (devices: Device[]) =>
    devices.map(device => device.serialNumber).join('\n');

export const AnimatedList: FC<{
    children: ReactNode;
    devices: Device[];
}> = ({ children, devices }) => (
    <Flipper element="ul" flipKey={changesOnReorder(devices)}>
        {children}
    </Flipper>
);
type onAppear = React.ComponentProps<typeof Flipped>['onAppear'];
type onExit = React.ComponentProps<typeof Flipped>['onExit'];

const fadeIn: onAppear = element =>
    spring({
        values: {
            opacity: [0, 1],
            scale: [0, 1],
        },
        // @ts-ignore Library types not correct
        onUpdate: ({ opacity, scale }) => {
            element.style.opacity = opacity;
            element.style.transform = `scaleY(${scale})`;
        },
    });

const fadeOut: onExit = (element, _, removeElement) =>
    spring({
        values: {
            opacity: [1, 0],
            scale: [1, 0],
        },
        // @ts-ignore Library types not correct
        onUpdate: ({ opacity, scale }) => {
            element.style.opacity = opacity;
            element.style.transform = `scaleY(${scale})`;
        },
        onComplete: () => {
            removeElement();
        },
    });

export const AnimatedItem: FC<{
    itemKey: string;
    children: ReactNode;
}> = ({ children, itemKey }) => (
    <Flipped flipId={itemKey} onAppear={fadeIn} onExit={fadeOut}>
        <li>{children}</li>
    </Flipped>
);
