/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    sections: [],
};

const slice = createSlice({
    name: 'documentation',
    initialState,
    reducers: {
        setDocumentationSections: (state, action) => {
            state.sections = action.payload;
        },
    },
});

export const {
    reducer,
    actions: { setDocumentationSections },
} = slice;

export const documentationSections = ({ documentation }) =>
    documentation.sections;
