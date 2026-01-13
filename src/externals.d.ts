/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

declare module 'prettysize' {
    export default function pretty(n: number): string;
}

declare module '*.module.scss' {
    const properties: {
        [property: string]: string;
    };
    export = properties;
}

interface Window {
    appDir: string;
    appDataDir: string;
    appLogDir: string;
}

// Let typescript compiler in `npm run lint` resolve css modules
declare module '*.icss.scss';
declare module '*.gif';

declare module '*.png' {
    const path: string;
    export default path;
}
