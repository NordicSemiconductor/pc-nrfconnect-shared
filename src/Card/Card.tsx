/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import classNames from '../utils/classNames';
import flatstr from '../utils/flatstr';

export interface CardTitleProps extends React.HTMLAttributes<HTMLElement> {
    cardTitle: React.ReactNode;
    cardSubtitle?: React.ReactNode;
}

export type CardTitleComponent = React.FC<CardTitleProps>;

const CardTitle: CardTitleComponent = ({
    cardTitle,
    cardSubtitle,
    className,
    ...attrs
}) => (
    <hgroup className={className} {...attrs}>
        <h3 className="tw-text-base tw-font-medium">{cardTitle}</h3>
        {cardSubtitle && <p>{cardSubtitle}</p>}
    </hgroup>
);

export type CardHeaderProps = React.HTMLAttributes<HTMLElement>;

export interface CardHeaderComponent extends React.FC<CardHeaderProps> {
    Title: CardTitleComponent;
}

const CardHeader: CardHeaderComponent = ({ children, className, ...attrs }) => (
    <header
        className={classNames(
            // prettier-ignore
            flatstr`tw-border-b tw-border-solid tw-border-b-black
            tw-border-opacity-10 tw-py-4`,
            className,
        )}
        {...attrs}
    >
        {children}
    </header>
);

CardHeader.Title = CardTitle;

export type CardBodyProps = React.HTMLAttributes<HTMLDivElement>;

export type CardBodyComponent = React.FC<CardBodyProps>;

const CardBody: CardBodyComponent = ({ className, children }) => (
    <div className={classNames('tw-flex tw-flex-auto tw-flex-col', className)}>
        {children}
    </div>
);

export interface CardProps {
    className?: string;
}

export interface CardComponent extends React.FC<CardProps> {
    Header: CardHeaderComponent;
    Body: CardBodyComponent;
}

export const Card: CardComponent = ({ children, className }) => (
    <article
        className={classNames(
            // prettier-ignore
            // Prettier has a bugged rule. Prettier doesn't care about multiline
            // strings, yet outputs an error on multiline strings
            // in jsx/tsx files
            flatstr`tw-preflight tw-relative tw-flex tw-flex-col tw-gap-4
            tw-break-words tw-border tw-border-solid tw-border-black
            tw-border-opacity-10 tw-bg-white tw-px-4 tw-pb-4`,
            className,
        )}
    >
        {children}
    </article>
);

Card.Header = CardHeader;
Card.Body = CardBody;
