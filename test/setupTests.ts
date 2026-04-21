/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable max-classes-per-file */

import '@testing-library/jest-dom/extend-expect';

import { configure } from '@testing-library/dom';

if (process.env.TESTING_ASYNC_TIMEOUT != null) {
    configure({ asyncUtilTimeout: Number(process.env.TESTING_ASYNC_TIMEOUT) });
}

window.ResizeObserver = class {
    observe() {} // eslint-disable-line no-empty-function,class-methods-use-this -- because we just stub things here
    disconnect() {} // eslint-disable-line no-empty-function,class-methods-use-this
    unobserve() {} // eslint-disable-line no-empty-function,class-methods-use-this
};

// See https://aronschueler.de/blog/2022/12/14/mocking-intersectionobserver-in-jest/
// Mock the IntersectionObserver, see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
window.IntersectionObserver = class {
    root = null;
    rootMargin = '';
    thresholds = [];

    // eslint-disable-next-line class-methods-use-this
    disconnect() {
        return null;
    }

    // eslint-disable-next-line class-methods-use-this
    observe() {
        return null;
    }

    // eslint-disable-next-line class-methods-use-this
    takeRecords() {
        return [];
    }

    // eslint-disable-next-line class-methods-use-this
    unobserve() {
        return null;
    }
};

window.DOMRect = class {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(
        x?: number | undefined,
        y?: number | undefined,
        width?: number | undefined,
        height?: number | undefined,
    ) {
        this.x = x ?? 0;
        this.y = y ?? 0;
        this.width = width ?? 0;
        this.height = height ?? 0;
    }

    get top() {
        return this.y;
    }

    get left() {
        return this.x;
    }

    get bottom() {
        return this.y + this.height;
    }

    get right() {
        return this.x + this.width;
    }

    // eslint-disable-next-line class-methods-use-this, no-empty-function
    toJSON() {}

    static fromRect(_rect?: DOMRectInit | undefined): DOMRect {
        return new DOMRect();
    }
};

window.Element.prototype.checkVisibility = () => true;
