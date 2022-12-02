/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import render from '../../test/testrenderer';
import Slider from './Slider';

describe('Slider component', () => {
    it('renders correct with ticks', () => {
        expect(
            render(
                <Slider
                    ticks
                    values={[2]}
                    range={{ min: 0, max: 5 }}
                    onChange={[() => {}]}
                />
            ).baseElement
        ).toMatchSnapshot();
    });
});
