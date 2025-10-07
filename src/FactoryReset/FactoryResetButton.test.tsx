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

const FACTORY_RESET = 'Factory reset';
const OK = 'Restore';
const CANCEL = 'Cancel';

describe('FactoryReset', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('clears the store', async () => {
        render(<FactoryResetButton label={FACTORY_RESET} />);
        fireEvent.click(screen.getByText(FACTORY_RESET));
        await screen.findByText(OK);
        fireEvent.click(screen.getByText(OK));
        expect(store().clear).toHaveBeenCalled();
    });

    it('does not clear the store when cancelled', async () => {
        render(<FactoryResetButton label={FACTORY_RESET} />);
        fireEvent.click(screen.getByText(FACTORY_RESET));
        await screen.findByText(CANCEL);
        fireEvent.click(screen.getByText(CANCEL));
        expect(store().clear).not.toHaveBeenCalled();
    });

    it('allows overriding the reset function', async () => {
        const overrideResetFn = jest.fn();
        render(
            <FactoryResetButton
                label={FACTORY_RESET}
                resetFn={overrideResetFn}
            />,
        );
        fireEvent.click(screen.getByText(FACTORY_RESET));
        await screen.findByText(OK);
        fireEvent.click(screen.getByText(OK));
        expect(overrideResetFn).toHaveBeenCalled();
    });
});
