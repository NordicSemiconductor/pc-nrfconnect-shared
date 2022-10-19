/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    PlaywrightTestArgs,
    PlaywrightTestOptions,
    PlaywrightWorkerArgs,
    PlaywrightWorkerOptions,
    TestType,
    Expect,
} from "@playwright/test";

export const test: TestType<
  PlaywrightTestArgs & PlaywrightTestOptions,
  PlaywrightWorkerArgs & PlaywrightWorkerOptions
  >;
export type expect = Expect;
