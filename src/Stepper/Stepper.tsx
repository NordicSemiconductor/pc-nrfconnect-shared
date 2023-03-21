/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import Button from '../Button/Button';
import classNames from '../utils/classNames';

import './stepper.scss';

type StepAction = StepString & {
    action: () => void;
};

type StepTooltip = StepString & {
    tooltip: string;
};

type StepString = {
    id: string;
    caption: string;
};

type StepState = 'active' | 'success' | 'warning' | 'failure';

type StepCaption = StepString | StepAction | StepTooltip;

export type Step = {
    id: string;
    title: string;
    caption?: string | (StepCaption | StepCaption[]);
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

const Caption = ({ caption }: { caption: string | StepCaption }) => {
    if (typeof caption === 'string') {
        return <span>{`${caption}`} </span>;
    }

    if (isStepAction(caption)) {
        return (
            <span>
                <Button
                    variant="custom"
                    className="action-link"
                    onClick={caption.action}
                >
                    {`${caption.caption}`}
                </Button>
                &nbsp;
            </span>
        );
    }

    if (isTooltip(caption)) {
        return (
            <OverlayTrigger
                placement="bottom-end"
                overlay={
                    <Tooltip id={`tooltip-${caption.caption}`}>
                        {caption.tooltip}
                    </Tooltip>
                }
            >
                <span>
                    <span className="tool-tip-trigger">{`${caption.caption}`}</span>
                    &nbsp;
                </span>
            </OverlayTrigger>
        );
    }

    return <span>{`${caption.caption}`} </span>;
};

const Steppers = ({ title, steps }: Steppers) => (
    <>
        {title && <div>{title}</div>}
        {steps.map(step => (
            <div
                key={step.id}
                className={classNames(
                    'step',
                    step.state && `step-${step.state}`
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
                            (Array.isArray(step.caption) ? (
                                step.caption?.map(caption => (
                                    <Caption
                                        key={caption.id}
                                        caption={caption}
                                    />
                                ))
                            ) : (
                                <Caption caption={step.caption} />
                            ))}
                    </div>
                </div>
            </div>
        ))}
    </>
);

export default Steppers;
