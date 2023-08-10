/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import classNames from '../utils/classNames';

import './stepper.scss';

type ActionCaption = StringCaption & {
    action: () => void;
};

type TooltipCaption = StringCaption & {
    tooltip: string;
};

type StringCaption = {
    id: string;
    caption: string;
};

type StepState = 'active' | 'success' | 'warning' | 'failure';

type StepCaption = StringCaption | ActionCaption | TooltipCaption;

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

const isToolTipCaption = (caption: StepCaption): caption is ActionCaption =>
    (caption as TooltipCaption).tooltip !== undefined;

const isActionCaption = (caption: StepCaption): caption is ActionCaption =>
    (caption as ActionCaption).action !== undefined;

const isStringCaption = (
    caption: string | StringCaption
): caption is string | StringCaption =>
    typeof caption === 'string' ||
    (!isToolTipCaption(caption) && !isActionCaption(caption));

const StepActionCaption = ({ caption }: { caption: ActionCaption }) => (
    <button type="button" className="action-link" onClick={caption.action}>
        {`${caption.caption}`}
    </button>
);

const StepTooltipCaption = ({ caption }: { caption: TooltipCaption }) => (
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

const StepStringCaption = ({
    caption,
}: {
    caption: string | StringCaption;
}) => {
    if (typeof caption === 'string') {
        return <span>{`${caption}`} </span>;
    }

    return <span>{`${caption.caption}`} </span>;
};

const Caption = ({ caption }: { caption: string | StepCaption }) => {
    if (isStringCaption(caption)) {
        return <StepStringCaption caption={caption} />;
    }

    if (isActionCaption(caption)) {
        return <StepActionCaption caption={caption} />;
    }

    return <StepTooltipCaption caption={caption} />;
};

export default ({ title, steps }: Steppers) => (
    <>
        <div className="stepper-reset" />
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
                        <div className="step-icon" />
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
