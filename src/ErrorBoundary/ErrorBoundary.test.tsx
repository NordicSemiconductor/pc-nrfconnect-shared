/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import reactGA from 'react-ga';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import render from '../../test/testrenderer';
import { getAppSpecificStore as store } from '../utils/persistentStore';
import { generateSystemReport } from '../utils/systemReport';
import ErrorBoundary from './ErrorBoundary';

const mockReactGA = reactGA;

jest.mock('../utils/systemReport');
jest.mock('react-ga');
jest.mock('../utils/usageData', () => ({
    ...jest.requireActual('../utils/usageData'),
    init: jest.fn(() => {
        mockReactGA.initialize('');
    }),
    sendErrorReport: jest.fn(),
    isEnabled: () => true,
}));

const SYSTEM_REPORT = 'system report';
const OKBUTTONTEXT = 'Restore';

const mockedGenerateSystemReport = generateSystemReport as jest.MockedFunction<
    typeof generateSystemReport
>;

mockedGenerateSystemReport.mockImplementation(
    () =>
        new Promise(res => {
            res(SYSTEM_REPORT);
        })
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

    it('should send GA event', async () => {
        render(
            <ErrorBoundary>
                <Child />
            </ErrorBoundary>
        );

        await waitFor(() => expect(reactGA.initialize).toHaveBeenCalled());
    });

    it('can take custom reporting functions', () => {
        const sendUsageData = jest.fn();

        render(
            <ErrorBoundary sendUsageData={sendUsageData}>
                <Child />
            </ErrorBoundary>
        );
        expect(sendUsageData).toHaveBeenCalled();
    });

    it('should render error boundary component when there is an error', () => {
        render(
            <ErrorBoundary>
                <Child />
            </ErrorBoundary>
        );
        const errorMessage = screen.getByText('Oops! There was a problem');
        expect(errorMessage).toBeDefined();
    });

    it('should clear store if factory reset', async () => {
        render(
            <ErrorBoundary>
                <Child />
            </ErrorBoundary>
        );
        fireEvent.click(screen.getByText('Restore default settings'));
        await screen.findByText(OKBUTTONTEXT);
        fireEvent.click(screen.getByText(OKBUTTONTEXT));
        expect(store().clear).toHaveBeenCalled();
    });

    it('should present system information', async () => {
        render(
            <ErrorBoundary>
                <Child />
            </ErrorBoundary>
        );
        const report = await screen.findByText(SYSTEM_REPORT);
        expect(report).toBeDefined();
    });
});
