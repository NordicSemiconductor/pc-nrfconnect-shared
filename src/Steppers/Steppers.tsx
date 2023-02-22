/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';

import classNames from '../utils/classNames';

import './steppers.scss';

export type Step = {
    title: string;
    caption?: string;
    active?: boolean;
    success?: boolean;
    fail?: boolean;
};

export interface Props {
    title?: string;
    steps: Step[];
}

const Steppers: FC<Props> = ({ title, steps }) => (
    <div className={classNames('steppers')}>
        {title && <div>{title}</div>}
        {steps.map(step => {
            console.log(step);
            return (
                <div
                    key={step.title}
                    className={classNames(
                        'step',
                        step.active && 'step-active',
                        step.success && 'step-success',
                        step.fail && 'step-fail'
                    )}
                >
                    <div>
                        <div className={classNames('circle')}>
                            {step.active && (
                                <div className={classNames('loading')} />
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="title">{step.title}</div>
                        <div className="caption">{step.caption}</div>
                    </div>
                </div>
            );
        })}
    </div>
);

export default Steppers;
