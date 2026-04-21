/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useId,
    useReducer,
    useRef,
} from 'react';
import _ from 'lodash';

import Popover from '../Popover/Popover';
import classNames from '../utils/classNames';

import styles from './Overlay.module.scss';

const isElementEnabled = (elem: React.ReactNode): boolean =>
    !(
        React.isValidElement(elem) &&
        elem.props instanceof Object &&
        'disabled' in elem.props &&
        elem.props.disabled
    );

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

interface OverlayState {
    isTriggerEnabled: boolean;
    isTriggerHovered: boolean;
    isOverlayHovered: boolean;
    showOverlay: boolean;
    placement: OverlayPlacement;
}

const initialOverlayState: OverlayState = {
    isTriggerEnabled: true,
    isTriggerHovered: false,
    isOverlayHovered: false,
    showOverlay: false,
    placement: 'bottom',
};

interface OverlaySetIsTriggerEnabledAction {
    type: 'setIsTriggerEnabled';
    isTriggerEnabled: OverlayState['isTriggerEnabled'];
}

interface OverlaySetIsTriggerHoveredAction {
    type: 'setIsTriggerHovered';
    isTriggerHovered: OverlayState['isTriggerHovered'];
}

interface OverlaySetIsOverlayHovered {
    type: 'setIsOverlayHovered';
    isOverlayHovered: OverlayState['isOverlayHovered'];
}

interface OverlaySetShowOverlayAction {
    type: 'setShowOverlay';
    showOverlay: OverlayState['showOverlay'];
}

interface OverlaySetPlacementAction {
    type: 'setPlacement';
    placement: OverlayPlacement;
}

type OverlayAction =
    | OverlaySetIsTriggerEnabledAction
    | OverlaySetIsTriggerHoveredAction
    | OverlaySetIsOverlayHovered
    | OverlaySetShowOverlayAction
    | OverlaySetPlacementAction;

const overlayReducer: React.Reducer<OverlayState, OverlayAction> = (
    state,
    action,
) => {
    switch (action.type) {
        case 'setIsTriggerEnabled':
            return {
                ...state,
                isTriggerEnabled: action.isTriggerEnabled,
            };
        case 'setIsTriggerHovered':
            return {
                ...state,
                isTriggerHovered: action.isTriggerHovered,
            };
        case 'setIsOverlayHovered':
            return {
                ...state,
                isOverlayHovered: action.isOverlayHovered,
            };
        case 'setShowOverlay':
            return {
                ...state,
                showOverlay: action.showOverlay,
            };
        case 'setPlacement':
            return {
                ...state,
                placement: action.placement,
            };
    }
};

const OverlayContext = createContext<OverlayState>(initialOverlayState);
const OverlayDispatchContext = createContext<React.ActionDispatch<
    [OverlayAction]
> | null>(null);

type OverlayTriggerProps = Pick<
    React.ComponentPropsWithRef<'div'>,
    'ref' | 'className'
>;

type OverlayTriggerComponent = React.FC<
    React.PropsWithChildren<OverlayTriggerProps>
>;

const OverlayTrigger: OverlayTriggerComponent = ({
    className,
    children,
    ...attrs
}) => {
    const stateDispatch = useContext(OverlayDispatchContext);

    useEffect(() => {
        stateDispatch?.({
            type: 'setIsTriggerEnabled',
            isTriggerEnabled: isElementEnabled(children),
        });
    }, [stateDispatch, children]);

    return (
        <div
            className={classNames(
                'tw-cursor-help',
                styles.overlayTrigger,
                className,
            )}
            onMouseEnter={() => {
                stateDispatch?.({
                    type: 'setIsTriggerHovered',
                    isTriggerHovered: true,
                });
            }}
            onMouseLeave={() => {
                stateDispatch?.({
                    type: 'setIsTriggerHovered',
                    isTriggerHovered: false,
                });
            }}
            {...attrs}
        >
            {children}
        </div>
    );
};

type OverlayOverlayProps = Pick<
    React.ComponentPropsWithRef<'dialog'>,
    'ref' | 'className'
>;

type OverlayOverlayComponent = React.FC<
    React.PropsWithChildren<OverlayOverlayProps>
>;

const OverlayOverlay: OverlayOverlayComponent = ({
    className,
    children,
    ...attrs
}) => {
    const overlayRef = useRef<HTMLDialogElement>(null);

    const { showOverlay, placement } = useContext(OverlayContext);
    const stateDispatch = useContext(OverlayDispatchContext);

    const positionAreaStyle = (() => {
        switch (placement) {
            case 'top-left':
                return styles.posTopLeft;
            case 'top':
                return styles.posTop;
            case 'top-right':
                return styles.posTopRight;
            case 'right-span-top':
                return styles.posRightSpanTop;
            case 'right':
                return styles.posRight;
            case 'right-span-bottom':
                return styles.posRightSpanBottom;
            case 'bottom-left':
                return styles.posBottomLeft;
            case 'bottom':
                return styles.posBottom;
            case 'bottom-right':
                return styles.posBottomRight;
            case 'left-span-top':
                return styles.posLeftSpanTop;
            case 'left':
                return styles.posLeft;
            case 'left-span-bottom':
                return styles.posLeftSpanBottom;
        }
    })();

    useEffect(() => {
        if (showOverlay) {
            // Currently there's no dedicated JS API for knowing if a popover
            // is open. Instead, we use the CSS API to know that through
            // the :popover-open pseudo-class.
            if (!overlayRef.current?.matches(':popover-open')) {
                overlayRef.current?.showPopover();
            }
        } else if (overlayRef.current?.matches(':popover-open')) {
            overlayRef.current?.hidePopover();
        }
    }, [overlayRef, showOverlay]);

    return (
        <Popover
            id={`${useId()}-overlay`}
            ref={overlayRef}
            closingBehavior="manual"
            className={classNames(
                'tw-inset-1 tw-border tw-border-solid tw-border-black tw-bg-black/80 tw-p-4 tw-text-white',
                styles.overlayOverlay,
                positionAreaStyle,
                className,
            )}
            onMouseEnter={() => {
                stateDispatch?.({
                    type: 'setIsOverlayHovered',
                    isOverlayHovered: true,
                });
            }}
            onMouseLeave={() => {
                stateDispatch?.({
                    type: 'setIsOverlayHovered',
                    isOverlayHovered: false,
                });
            }}
            {...attrs}
        >
            {children}
        </Popover>
    );
};

interface OverlayProps
    extends Pick<React.ComponentPropsWithRef<'div'>, 'ref' | 'className'> {
    triggerElem?: OverlayTriggerElem;
    triggerRestraint?: OverlayTriggerRestraint;
    placement?: OverlayPlacement;
}

interface OverlayComponent
    extends React.FC<React.PropsWithChildren<OverlayProps>> {
    Trigger: OverlayTriggerComponent;
    Overlay: OverlayOverlayComponent;
}

const Overlay: OverlayComponent = ({
    triggerElem = 'base',
    triggerRestraint = 'only-enabled',
    placement = 'bottom',
    children,
    ...attrs
}) => {
    const [state, stateDispatch] = useReducer(overlayReducer, {
        ...initialOverlayState,
        placement,
    });

    const debouncedShowOverlay = useRef(
        _.debounce(
            useCallback(() => {
                stateDispatch({ type: 'setShowOverlay', showOverlay: true });
            }, [stateDispatch]),
            500,
            {
                leading: false,
                trailing: true,
            },
        ),
    );
    const debouncedHideOverlay = useRef(
        _.debounce(
            useCallback(() => {
                stateDispatch({ type: 'setShowOverlay', showOverlay: false });
            }, [stateDispatch]),
            500,
            {
                leading: false,
                trailing: true,
            },
        ),
    );

    useEffect(() => {
        const satisfiesTriggerElem = () => {
            switch (triggerElem) {
                case 'base':
                    return state.isTriggerHovered;
                case 'base-or-overlay':
                    return state.isTriggerHovered || state.isOverlayHovered;
            }
        };

        const satisfiesTriggerRestraint = () => {
            if (!triggerRestraint) {
                return true;
            }

            switch (triggerRestraint) {
                case 'only-enabled':
                    return state.isTriggerEnabled;
            }
        };

        if (satisfiesTriggerElem() && satisfiesTriggerRestraint()) {
            debouncedShowOverlay.current();
            debouncedHideOverlay.current.cancel();
        } else {
            debouncedHideOverlay.current();
            debouncedShowOverlay.current.cancel();
        }
    }, [
        triggerElem,
        triggerRestraint,
        state.isTriggerEnabled,
        state.isTriggerHovered,
        state.isOverlayHovered,
    ]);

    return (
        <div {...attrs}>
            <OverlayContext.Provider value={state}>
                <OverlayDispatchContext.Provider value={stateDispatch}>
                    {children}
                </OverlayDispatchContext.Provider>
            </OverlayContext.Provider>
        </div>
    );
};

Overlay.Trigger = OverlayTrigger;
Overlay.Overlay = OverlayOverlay;

export default Overlay;
