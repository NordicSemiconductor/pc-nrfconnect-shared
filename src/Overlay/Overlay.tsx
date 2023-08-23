/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import './overlay.scss';

export default ({
    keepShowingOnHoverTooltip,
    /*
     * To show a tooltip when hovering over disabled elements,
     * add `pointer-events: none;`
     */
    children,
    tooltipId,
    placement = 'bottom-start',
    tooltipChildren,
}: {
    keepShowingOnHoverTooltip?: boolean;
    children: React.ReactNode;
    tooltipId: string;
    placement?:
        | 'top-start'
        | 'top'
        | 'top-end'
        | 'right-start'
        | 'right'
        | 'right-end'
        | 'bottom-end'
        | 'bottom'
        | 'bottom-start'
        | 'left-end'
        | 'left'
        | 'left-start';
    tooltipChildren: React.ReactNode;
}) => {
    const [show, setShow] = useState<boolean>();

    return (
        <OverlayTrigger
            placement={placement}
            show={show}
            delay={500}
            overlay={
                <Tooltip
                    id={tooltipId}
                    show={show}
                    className="tooltip"
                    onMouseEnter={() => {
                        if (keepShowingOnHoverTooltip) {
                            setShow(true);
                        }
                    }}
                    onMouseLeave={() => {
                        setShow(undefined);
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    {tooltipChildren}
                </Tooltip>
            }
        >
            <div>{children}</div>
        </OverlayTrigger>
    );
};
