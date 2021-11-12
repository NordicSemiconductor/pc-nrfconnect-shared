/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { func, string } from 'prop-types';

import './pseudo-button.scss';

const invokeIfSpaceOrEnterPressed =
    (onClick: React.KeyboardEventHandler<Element>) =>
    (event: React.KeyboardEvent) => {
        event.stopPropagation();
        if (event.key === ' ' || event.key === 'Enter') {
            onClick(event);
        }
    };

const blurAndInvoke =
    (
        onClick: React.MouseEventHandler<HTMLElement>
    ): React.MouseEventHandler<HTMLElement> =>
    (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        event.currentTarget.blur();
        onClick(event);
    };

// Motivation for this class: A normal button in HTML must not contain divs or other buttons,
// but we do have things that behave like buttons and at the same time should contain such things
const PseudoButton: React.FC<{
    className?: string;
    title?: string;
    onClick?: React.EventHandler<React.SyntheticEvent>;
}> = ({ onClick = () => {}, className = '', children, title }) => (
    <div
        role="button"
        className={`core19-pseudo-button ${className}`}
        tabIndex={0}
        onClick={blurAndInvoke(onClick)}
        onKeyUp={invokeIfSpaceOrEnterPressed(onClick)}
        title={title}
    >
        {children}
    </div>
);
PseudoButton.propTypes = {
    onClick: func,
    className: string,
    title: string,
};

export default PseudoButton;
