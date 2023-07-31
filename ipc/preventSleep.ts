/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { handle, invoke, on, send } from './infrastructure/rendererToMain';

const channel = {
    start: 'prevent-sleep:start',
    end: 'prevent-sleep:end',
};

type Start = () => number;
const start = invoke<Start>(channel.start);
const registerStart = handle<Start>(channel.start);

type End = (id: number) => void;
const end = send<End>(channel.end);
const registerEnd = on<End>(channel.end);

export const forRenderer = { registerStart, registerEnd };
export const inMain = { start, end };
