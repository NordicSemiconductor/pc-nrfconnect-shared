/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useContext, useRef } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import AccordionContext from 'react-bootstrap/AccordionContext';
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';

import PseudoButton from '../PseudoButton/PseudoButton';
import classNames from '../utils/classNames';

import './group.scss';

const Heading = ({ label, title }: { label?: string; title?: string }) =>
    label == null ? null : (
        <h2 className="heading" title={title}>
            {label}
        </h2>
    );

const ContextAwareToggle = ({
    heading,
    title,
    eventKey,
    onToggled,
}: {
    heading: string;
    title?: string;
    eventKey: string;
    onToggled?: ((isNowExpanded: boolean) => void) | null;
}) => {
    const currentEventKey = useContext(AccordionContext);
    const isCurrentEventKey = currentEventKey === eventKey;
    const decoratedOnClick = useAccordionToggle(
        eventKey,
        () => onToggled && onToggled(!isCurrentEventKey)
    );

    return (
        <PseudoButton
            onClick={decoratedOnClick}
            className={classNames('group-toggle', isCurrentEventKey && 'show')}
        >
            <Heading label={heading} title={title} />
            <span className="mdi mdi-chevron-down" />
        </PseudoButton>
    );
};

export const CollapsibleGroup = ({
    className = '',
    heading,
    title,
    children = null,
    defaultCollapsed = true,
    onToggled,
}: {
    className?: string;
    heading: string;
    title?: string;
    children?: React.ReactNode;
    defaultCollapsed?: boolean | null;
    onToggled?: ((isNowExpanded: boolean) => void) | null;
}) => {
    const eventKey = useRef(Math.random().toString());

    return (
        <div className={`sidepanel-group ${className}`}>
            <Accordion
                defaultActiveKey={defaultCollapsed ? '' : eventKey.current}
            >
                <div className="collapse-container">
                    <ContextAwareToggle
                        heading={heading}
                        title={title}
                        eventKey={eventKey.current}
                        onToggled={onToggled}
                    />
                    <Accordion.Collapse eventKey={eventKey.current}>
                        <div className="body">{children}</div>
                    </Accordion.Collapse>
                </div>
            </Accordion>
        </div>
    );
};

export const Group = ({
    className = '',
    heading,
    title,
    children,
}: {
    className?: string;
    heading?: string;
    title?: string;
    children?: React.ReactNode;
}) => (
    <div className={`sidepanel-group ${className}`}>
        <Heading label={heading} title={title} />
        <div className="body">{children}</div>
    </div>
);
