/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import { Metadata } from './telemetryCommon';

const flatObject = (obj?: unknown, parentKey?: string): Metadata =>
    Object.entries(obj ?? {}).reduce((acc, [key, value]) => {
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        return {
            ...acc,
            ...(typeof value === 'object'
                ? flatObject(value, newKey)
                : { [newKey]: value }),
        };
    }, {});

export default flatObject;
