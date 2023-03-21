/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable simple-import-sort/imports --
   sorting the import order must be disabled for this file because enzyme
   and testing-library are sensitive to the order in which they are run
*/
import enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import '@testing-library/jest-dom/extend-expect';
import { configure } from '@testing-library/dom';

enzyme.configure({ adapter: new Adapter() });

if (process.env.TESTING_ASYNC_TIMEOUT != null) {
    configure({ asyncUtilTimeout: Number(process.env.TESTING_ASYNC_TIMEOUT) });
}

window.ResizeObserver = class {
    observe() {} // eslint-disable-line class-methods-use-this -- because we just stub things here
    disconnect() {} // eslint-disable-line class-methods-use-this
    unobserve() {} // eslint-disable-line class-methods-use-this
};
