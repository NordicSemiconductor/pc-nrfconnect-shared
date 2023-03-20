/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import Button from '../Button/Button';
import classNames from '../utils/classNames';

import './steppers.scss';

export type StepState = 'active' | 'success' | 'warning' | 'failure';

export type StepAction = {
    caption: string;
    action: () => void;
};

export type StepTooltip = {
    caption: string;
    tooltip: string;
};

export type StepCaption = string | StepAction | StepTooltip;

export type Step = {
    title: string;
    caption?: StepCaption | StepCaption[];
    state?: StepState;
};

export interface Steppers {
    title?: string;
    steps: Step[];
}

const convertStepCaptionToJsx = (stepCaption: StepCaption) => {
    if (typeof stepCaption === 'string') {
        return <span>{`${stepCaption}`} </span>;
    }

    if (Object.prototype.hasOwnProperty.call(stepCaption, 'tooltip')) {
        return (
            <OverlayTrigger
                placement="bottom-end"
                overlay={
                    <Tooltip id={`tooltip-${stepCaption.caption}`}>
                        {(stepCaption as StepTooltip).tooltip}
                    </Tooltip>
                }
            >
                <span>
                    <span className="tool-tip-trigger">{`${stepCaption.caption}`}</span>
                    &nbsp;
                </span>
            </OverlayTrigger>
        );
    }

    return (
        <span>
            <Button
                variant="custom"
                className="action-link"
                onClick={(stepCaption as StepAction).action}
            >
                {`${stepCaption.caption}`}
            </Button>
            &nbsp;
        </span>
    );
};

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
                    <div className="caption">
                        {Array.isArray(step.caption)
                            ? step.caption?.map((caption, index) => (
                                  <span
                                      key={`caption-${step.title}--${
                                          index + 0
                                      }`}
                                  >
                                      {convertStepCaptionToJsx(caption)}
                                  </span>
                              ))
                            : convertStepCaptionToJsx(step.caption ?? '')}
                    </div>
                </div>
            </div>
        ))}
    </>
);

export default Steppers;
