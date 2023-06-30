/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useEffect, useRef } from 'react';

/**
 * Focus an element (usually an input) when a dialog becomes visible.
 * Use the concrete elements type as a type parameter.
 *
 * @param {boolean} isVisible - Whether the dialog is visible
 * @returns {React.RefObject<T>} A ref to pass to the element which should be focused
 */
export default <T extends HTMLElement>(isVisible: boolean) => {
    const ref = useRef<T>(null);

    useEffect(() => {
        if (isVisible) {
            ref.current?.focus();
        }
    }, [isVisible]);

    return ref;
};
