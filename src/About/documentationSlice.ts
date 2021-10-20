/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { createSlice } from '@reduxjs/toolkit';

interface DocumentationSectionProps {
    title?: string;
    linkLabel?: string;
    link?: string;
}

interface DocumentationState {
    sections: React.Component<DocumentationSectionProps>[];
}

const initialState: DocumentationState = {
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

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const documentationSections = ({ documentation }: any) =>
    documentation.sections;
