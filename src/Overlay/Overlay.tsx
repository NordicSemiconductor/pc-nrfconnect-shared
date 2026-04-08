/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import './overlay.scss';

type OverlayBaseProps = Pick<
    React.ComponentPropsWithRef<'div'>,
    'ref' | 'className'
>;

type OverlayBaseComponent = React.FC<React.PropsWithChildren<OverlayBaseProps>>;

const OverlayBase: OverlayBaseComponent = ({ children, ...attrs }) => (
    <div className="tw-cursor-help" {...attrs}>
        {children}
    </div>
);

type OverlayOverlayProps = Pick<
    React.ComponentPropsWithRef<'div'>,
    'ref' | 'className'
>;

type OverlayOverlayComponent = React.FC<
    React.PropsWithChildren<OverlayOverlayProps>
>;

const OverlayOverlay: OverlayOverlayComponent = ({ children, ...attrs }) => (
    <div {...attrs}>{children}</div>
);

type OverlayTriggerElem = 'base' | 'base-or-overlay';
type OverlayTriggerRestraint = null | 'only-active';
type OverlayPlacement =
    | 'top-left'
    | 'top'
    | 'top-right'
    | 'right-span-top'
    | 'right'
    | 'right-span-bottom'
    | 'bottom-left'
    | 'bottom'
    | 'bottom-right'
    | 'left-span-top'
    | 'left'
    | 'left-span-bottom';

interface OverlayProps
    extends Pick<React.ComponentPropsWithRef<'div'>, 'ref' | 'className'> {
    triggerElem?: OverlayTriggerElem;
    triggerRestraint?: OverlayTriggerRestraint;
    placement?: OverlayPlacement;
}

interface OverlayComponent
    extends React.FC<React.PropsWithChildren<OverlayProps>> {
    Base: OverlayBaseComponent;
    Overlay: OverlayOverlayComponent;
}

const Overlay: OverlayComponent = ({
    triggerElem = 'base',
    triggerRestraint = 'only-active',
    placement = 'bottom',
    children,
    ...attrs
}) => {
    const [showOverlay, setShowOverlay] = useState<boolean>(false);

    return <div {...attrs}>{children}</div>;
};

Overlay.Base = OverlayBase;
Overlay.Overlay = OverlayOverlay;

export default Overlay;

const old = ({
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
                    className="shared-tooltip"
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
            <div className="tw-cursor-help">{children}</div>
        </OverlayTrigger>
    );
};
