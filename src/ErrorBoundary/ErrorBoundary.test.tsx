/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';

import render from '../../test/testrenderer';
import { getAppSpecificStore as store } from '../utils/persistentStore';
import { generateSystemReport } from '../utils/systemReport';
import ErrorBoundary from './ErrorBoundary';

jest.mock('../utils/systemReport');
jest.mock('../telemetry/telemetry', () => ({
    ...jest.requireActual('../telemetry/telemetry'),
    sendErrorReport: jest.fn(),
    isEnabled: () => true,
}));

const SYSTEM_REPORT = 'system report';
const OKBUTTONTEXT = 'Restore';

jest.mocked(generateSystemReport).mockImplementation(
    () =>
        new Promise(res => {
            res(SYSTEM_REPORT);
        }),
);

const Child = () => {
    throw new Error();
};

describe('ErrorBoundary', () => {
    beforeEach(() => {
        const spy = jest.spyOn(console, 'error');
        spy.mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('accepts custom reporting functions', () => {
        const sendTelemetryEvent = jest.fn();

        render(
            <ErrorBoundary sendTelemetryEvent={sendTelemetryEvent}>
                <Child />
            </ErrorBoundary>,
        );
        expect(sendTelemetryEvent).toHaveBeenCalled();
    });

    it('renders error boundary component when there is an error', () => {
        render(
            <ErrorBoundary>
                <Child />
            </ErrorBoundary>,
        );
        const errorMessage = screen.getByText('Oops! There was a problem');
        expect(errorMessage).toBeDefined();
    });

    it('clears store on factory reset', async () => {
        render(
            <ErrorBoundary>
                <Child />
            </ErrorBoundary>,
        );
        fireEvent.click(screen.getByText('Restore default settings'));
        await screen.findByText(OKBUTTONTEXT);
        fireEvent.click(screen.getByText(OKBUTTONTEXT));
        expect(store().clear).toHaveBeenCalled();
    });

    it('presents system information', async () => {
        render(
            <ErrorBoundary>
                <Child />
            </ErrorBoundary>,
        );
        const report = await screen.findByText(SYSTEM_REPORT);
        expect(report).toBeDefined();
    });
});
