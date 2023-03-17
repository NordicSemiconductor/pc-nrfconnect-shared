/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import classNames from '../utils/classNames';

import './steppers.scss';

export type StepState = 'active' | 'success' | 'warning' | 'failure';

export type Step = {
    title: string;
    caption?: string;
    state?: StepState;
};

export interface Steppers {
    title?: string;
    steps: Step[];
}

const Steppers = ({ title, steps }: Steppers) => (
    <>
        {title && <div>{title}</div>}
        {steps.map(step => (
            <div
                key={step.title}
                className={classNames(
                    'step',
                    step.state === 'active' && 'step-active',
                    step.state === 'success' && 'step-success',
                    step.state === 'failure' && 'step-failure',
                    step.state === 'warning' && 'step-warning'
                )}
            >
                <div>
                    <div className="circle">
                        {step.state && <div className="step-icon" />}
                    </div>
                    <div className="line" />
                </div>
                <div>
                    <div className="title">{step.title}</div>
                    <div className="caption">{step.caption}</div>
                </div>
            </div>
        ))}
    </>
);

export default Steppers;
