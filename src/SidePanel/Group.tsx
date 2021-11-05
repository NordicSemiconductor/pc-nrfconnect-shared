/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useContext, useRef } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import AccordionContext from 'react-bootstrap/AccordionContext';
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';
import { bool, func, string } from 'prop-types';

import PseudoButton from '../PseudoButton/PseudoButton';
import classNames from '../utils/classNames';

import './group.scss';

const Heading: React.FC<{
    label?: string;
    title?: string;
}> = ({ label, title }) =>
    label == null ? null : (
        <h2 className="heading" title={title}>
            {label}
        </h2>
    );
Heading.propTypes = {
    label: string,
    title: string,
};

const ContextAwareToggle: React.FC<{
    heading: string;
    title?: string;
    eventKey: string;
    onToggled?: ((isNowExpanded: boolean) => void) | null;
}> = ({ heading, title, eventKey, onToggled }) => {
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
        </PseudoButton>
    );
};
ContextAwareToggle.propTypes = {
    heading: string.isRequired,
    title: string,
    eventKey: string.isRequired,
    onToggled: func,
};

export const CollapsibleGroup: React.FC<{
    className?: string;
    heading: string;
    title?: string;
    defaultCollapsed?: boolean | null;
    onToggled?: ((isNowExpanded: boolean) => void) | null;
}> = ({
    className = '',
    heading,
    title,
    children = null,
    defaultCollapsed = true,
    onToggled,
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

CollapsibleGroup.propTypes = {
    className: string,
    heading: string.isRequired,
    title: string,
    defaultCollapsed: bool,
    onToggled: func,
};

export const Group: React.FC<{
    className?: string;
    heading?: string;
    title?: string;
}> = ({ className = '', heading, title, children }) => (
    <div className={`sidepanel-group ${className}`}>
        <Heading label={heading} title={title} />
        <div className="body">{children}</div>
    </div>
);
Group.propTypes = {
    className: string,
    heading: string,
    title: string,
};
