/* Copyright (c) 2015 - 2021, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';
import { fireEvent } from '@testing-library/react';

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
        const { getByText, findByText } = render(
            <FactoryResetButton label={LABEL} />
        );
        fireEvent.click(getByText(LABEL));
        await findByText(OKBUTTONTEXT);
        fireEvent.click(getByText(OKBUTTONTEXT));
        expect(store().clear).toHaveBeenCalled();
    });

    it('should not clear store when cancelled', async () => {
        const { getByText, findByText } = render(
            <FactoryResetButton label={LABEL} />
        );
        fireEvent.click(getByText(LABEL));
        await findByText('Cancel');
        fireEvent.click(getByText('Cancel'));
        expect(store().clear).not.toHaveBeenCalled();
    });

    it('is possible to override reset function', async () => {
        const overrideResetFn = jest.fn();
        const { getByText, findByText } = render(
            <FactoryResetButton label={LABEL} resetFn={overrideResetFn} />
        );
        fireEvent.click(getByText(LABEL));
        await findByText(OKBUTTONTEXT);
        fireEvent.click(getByText(OKBUTTONTEXT));
        expect(overrideResetFn).toHaveBeenCalled();
    });
});
