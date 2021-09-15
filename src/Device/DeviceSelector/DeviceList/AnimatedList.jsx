/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Flipped, Flipper, spring } from 'react-flip-toolkit';
import { arrayOf, node, string } from 'prop-types';

import deviceShape from '../deviceShape';

const changesOnReorder = devices =>
    devices.map(device => device.serialNumber).join('\n');

export const AnimatedList = ({ children, devices }) => (
    <Flipper element="ul" flipKey={changesOnReorder(devices)}>
        {children}
    </Flipper>
);
AnimatedList.propTypes = {
    children: node.isRequired,
    devices: arrayOf(deviceShape.isRequired).isRequired,
};

const fadeInOrOut = fadeOut => (element, _, removeElement) => {
    const range = fadeOut ? [1, 0] : [0, 1];
    return spring({
        values: {
            opacity: range,
            scale: range,
        },
        onUpdate: ({ opacity, scale }) => {
            element.style.opacity = opacity; // eslint-disable-line no-param-reassign
            element.style.transform = `scaleY(${scale})`; // eslint-disable-line no-param-reassign
        },
        onComplete: () => {
            if (fadeOut) {
                removeElement();
            }
        },
    });
};

export const AnimatedItem = ({ children, itemKey }) => (
    <Flipped
        flipId={itemKey}
        onAppear={fadeInOrOut(false)}
        onExit={fadeInOrOut(true)}
    >
        <li>{children}</li>
    </Flipped>
);
AnimatedItem.propTypes = {
    itemKey: string.isRequired,
    children: node.isRequired,
};
