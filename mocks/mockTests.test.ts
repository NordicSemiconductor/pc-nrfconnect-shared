/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

test('electron-store', () => {
    const Store = jest.requireMock('electron-store').default;
    const store = new Store();
    expect(store.get('test', 'default')).toEqual('default');
    store.set('test', 'newValue');
    expect(store.get('test', 'default')).toEqual('newValue');
    store.clear();
    expect(store.get('test', 'default')).toEqual('default');
});
