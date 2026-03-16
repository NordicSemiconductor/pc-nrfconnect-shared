/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import classNames from '../utils/classNames';
import flatstr from '../utils/flatstr';

type PickedCardTitleProps = 'ref' | 'className';

interface CardTitleProps
    extends Pick<React.ComponentPropsWithRef<'div'>, PickedCardTitleProps> {
    cardTitle: React.ReactNode;
    cardSubtitle?: React.ReactNode;
}

type CardTitleComponent = React.FC<CardTitleProps>;

const CardTitle: CardTitleComponent = ({
    cardTitle,
    cardSubtitle,
    ...attrs
}) => (
    <hgroup {...attrs}>
        <h3 className="tw-text-base tw-font-medium">{cardTitle}</h3>
        {cardSubtitle && <p>{cardSubtitle}</p>}
    </hgroup>
);

type PickedCardHeaderProps = 'ref' | 'className';

type CardHeaderProps = Pick<
    React.ComponentPropsWithRef<'header'>,
    PickedCardHeaderProps
>;

interface CardHeaderComponent extends React.FC<CardHeaderProps> {
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

type PickedCardBodyProps = 'ref' | 'className';

type CardBodyProps = Pick<
    React.ComponentPropsWithRef<'div'>,
    PickedCardBodyProps
>;

type CardBodyComponent = React.FC<CardBodyProps>;

const CardBody: CardBodyComponent = ({ className, children, ...attrs }) => (
    <div className={classNames('tw-flex tw-flex-col', className)} {...attrs}>
        {children}
    </div>
);

type PickedCardProps = 'ref' | 'className';

type CardProps = Pick<React.ComponentPropsWithRef<'article'>, PickedCardProps>;

interface CardComponent extends React.FC<CardProps> {
    Header: CardHeaderComponent;
    Body: CardBodyComponent;
}

const Card: CardComponent = ({ children, className, ...attrs }) => (
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
        {...attrs}
    >
        {children}
    </article>
);

Card.Header = CardHeader;
Card.Body = CardBody;

export default Card;
