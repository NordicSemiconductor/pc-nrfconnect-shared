/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { Fragment } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import Button from '../Button/Button';
import classNames from '../utils/classNames';

import './steppers.scss';

type StepAction = StepString & {
    action: () => void;
};

type StepTooltip = StepString & {
    tooltip: string;
};

type StepString = {
    id?: string;
    caption: string;
};

type StepState = 'active' | 'success' | 'warning' | 'failure';

type StepCaption = StepString | StepAction | StepTooltip;

export type Step = {
    id?: string;
    title: string;
    caption?: StepCaption | StepCaption[];
    state?: StepState;
};

export interface Steppers {
    title?: string;
    steps: Step[];
}

const isTooltip = (caption: StepCaption): caption is StepTooltip =>
    (caption as StepTooltip).tooltip !== undefined;

const isStepAction = (caption: StepCaption): caption is StepAction =>
    (caption as StepAction).action !== undefined;

const convertStepCaptionToJsx = (stepCaption: StepCaption) => {
    if (isStepAction(stepCaption)) {
        return (
            <span>
                <Button
                    variant="custom"
                    className="action-link"
                    onClick={stepCaption.action}
                >
                    {`${stepCaption.caption}`}
                </Button>
                &nbsp;
            </span>
        );
    }

    if (isTooltip(stepCaption)) {
        return (
            <OverlayTrigger
                placement="bottom-end"
                overlay={
                    <Tooltip id={`tooltip-${stepCaption.caption}`}>
                        {stepCaption.tooltip}
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

    return <span>{`${stepCaption.caption}`} </span>;
};

const Steppers = ({ title, steps }: Steppers) => (
    <>
        {title && <div>{title}</div>}
        {steps.map(step => (
            <div
                key={step.id ?? step.title}
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
                        {step.caption &&
                            (Array.isArray(step.caption)
                                ? step.caption?.map(caption => (
                                      <Fragment
                                          key={caption.id ?? caption.caption}
                                      >
                                          {convertStepCaptionToJsx(caption)}
                                      </Fragment>
                                  ))
                                : convertStepCaptionToJsx(step.caption))}
                    </div>
                </div>
            </div>
        ))}
    </>
);

export default Steppers;
