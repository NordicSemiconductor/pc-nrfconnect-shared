/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import './overlay.scss';
import Popover from '../Popover/Popover';

const isElementEnabled = (elem: React.ReactNode): boolean =>
    !(
        React.isValidElement(elem) &&
        elem.props instanceof Object &&
        'disabled' in elem.props &&
        elem.props.disabled
    );

type OverlayBaseProps = Pick<
    React.ComponentPropsWithRef<'div'>,
    'ref' | 'className'
>;

type OverlayBaseComponent = React.FC<React.PropsWithChildren<OverlayBaseProps>>;

const OverlayBase: OverlayBaseComponent = ({ children, ...attrs }) => {
    const { setIsBaseHovered, setIsBaseEnabled } = useContext(OverlayContext);

    setIsBaseEnabled?.(isElementEnabled(children));

    return (
        <div
            className="tw-cursor-help"
            onMouseEnter={() => {
                setIsBaseHovered?.(true);
            }}
            onMouseLeave={() => {
                setIsBaseHovered?.(false);
            }}
            {...attrs}
        >
            {children}
        </div>
    );
};

type OverlayOverlayProps = Pick<
    React.ComponentPropsWithRef<'div'>,
    'ref' | 'className'
>;

type OverlayOverlayComponent = React.FC<
    React.PropsWithChildren<OverlayOverlayProps>
>;

const OverlayOverlay: OverlayOverlayComponent = ({ children, ...attrs }) => {
    const { setIsOverlayHovered, showOverlay } = useContext(OverlayContext);

    return (
        <Popover
            onMouseEnter={() => {
                setIsOverlayHovered?.(true);
            }}
            onMouseLeave={() => {
                setIsOverlayHovered?.(false);
            }}
            {...attrs}
        >
            {children}
        </Popover>
    );
};

type OverlayTriggerElem = 'base' | 'base-or-overlay';
type OverlayTriggerRestraint = 'only-enabled';
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

interface OverlayContextTy {
    setIsBaseEnabled?: (isBaseEnabled: boolean) => void;
    setIsBaseHovered?: (isBaseHovered: boolean) => void;
    setIsOverlayHovered?: (isOverlayHovered: boolean) => void;
    showOverlay: boolean;
}

const OverlayContext = createContext<OverlayContextTy>({});

const Overlay: OverlayComponent = ({
    triggerElem = 'base',
    triggerRestraint = 'only-enabled',
    placement = 'bottom',
    children,
    ...attrs
}) => {
    const [showOverlay, setShowOverlay] = useState<boolean>(false);

    const [isBaseHovered, setIsBaseHovered] = useState<boolean>(false);
    const [isOverlayHovered, setIsOverlayHovered] = useState<boolean>(false);
    const [isBaseEnabled, setIsBaseEnabled] = useState<boolean>(false);

    useEffect(() => {
        const satisfiesTriggerElem = () => {
            switch (triggerElem) {
                case 'base':
                    return isBaseHovered;
                case 'base-or-overlay':
                    return isBaseHovered || isOverlayHovered;
            }
        };

        const satisfiesTriggerRestraint = () => {
            if (!triggerRestraint) {
                return true;
            }

            switch (triggerRestraint) {
                case 'only-enabled':
                    return isBaseEnabled;
            }
        };

        setShowOverlay(satisfiesTriggerElem() && satisfiesTriggerRestraint());
    }, [
        triggerElem,
        triggerRestraint,
        isBaseEnabled,
        isBaseHovered,
        isOverlayHovered,
    ]);

    return (
        <div {...attrs}>
            <OverlayContext
                value={{
                    setIsBaseEnabled,
                    setIsBaseHovered,
                    setIsOverlayHovered,
                    showOverlay,
                }}
            >
                {children}
            </OverlayContext>
        </div>
    );
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
