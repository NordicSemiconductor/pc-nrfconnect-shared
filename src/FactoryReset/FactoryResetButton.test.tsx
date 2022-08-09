/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';

import render from '../../test/testrenderer';
import { getAppSpecificStore as store } from '../utils/persistentStore';
import FactoryResetButton from './FactoryResetButton';

const LABEL = 'Factory reset';
const OKBUTTONTEXT = 'Restore';

describe('FactoryReset', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should clear store when confirmed', async () => {
        render(<FactoryResetButton label={LABEL} />);
        fireEvent.click(screen.getByText(LABEL));
        await screen.findByText(OKBUTTONTEXT);
        fireEvent.click(screen.getByText(OKBUTTONTEXT));
        expect(store().clear).toHaveBeenCalled();
    });

    it('should not clear store when cancelled', async () => {
        render(<FactoryResetButton label={LABEL} />);
        fireEvent.click(screen.getByText(LABEL));
        await screen.findByText('Cancel');
        fireEvent.click(screen.getByText('Cancel'));
        expect(store().clear).not.toHaveBeenCalled();
    });

    it('is possible to override reset function', async () => {
        const overrideResetFn = jest.fn();
        render(<FactoryResetButton label={LABEL} resetFn={overrideResetFn} />);
        fireEvent.click(screen.getByText(LABEL));
        await screen.findByText(OKBUTTONTEXT);
        fireEvent.click(screen.getByText(OKBUTTONTEXT));
        expect(overrideResetFn).toHaveBeenCalled();
    });
});
