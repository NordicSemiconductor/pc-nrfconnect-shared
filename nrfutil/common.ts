/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { NrfutilProgress, Progress } from './sandboxTypes';

export const convertNrfutilProgress = (progress: NrfutilProgress): Progress => {
    const amountOfSteps = progress.amountOfSteps ?? 1;
    const step = progress.step ?? 1;

    const singleStepWeight = (1 / amountOfSteps) * 100;

    const totalProgressPercentage =
        singleStepWeight * (step - 1) +
        progress.progressPercentage / amountOfSteps;

    return {
        ...progress,
        stepProgressPercentage: progress.progressPercentage,
        totalProgressPercentage,
        amountOfSteps,
        step,
    };
};

export const parseJsonBuffers = <T>(data: Buffer): T[] | undefined => {
    const dataString = data.toString().trim();
    if (!dataString.endsWith('}')) {
        return undefined;
    }
    try {
        return JSON.parse(`[${dataString.replaceAll('}\n{', '}\n,{')}]`) ?? [];
    } catch {
        return undefined;
    }
};

export const collectErrorMessages = (...messages: (string | undefined)[]) =>
    messages.filter(Boolean).join('\n').replaceAll('Error: ', '');
