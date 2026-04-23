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
    useMemo,
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

type OverlayTriggerElem = 'trigger' | 'trigger-or-overlay';
type OverlayTriggerRestraint = 'only-enabled';
type OverlayPlacement =
    | 'top-span-right'
    | 'top-span-left'
    | 'top'
    | 'bottom-span-right'
    | 'bottom-span-left'
    | 'bottom'
    | 'left-span-top'
    | 'left-span-bottom'
    | 'left'
    | 'right-span-top'
    | 'right-span-bottom'
    | 'right';

type OverlayArrowPlacement =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
    | 'left-top'
    | 'left-center'
    | 'left-bottom'
    | 'right-top'
    | 'right-center'
    | 'right-bottom';

interface OverlayState {
    isTriggerEnabled: boolean;
    isTriggerHovered: boolean;
    isOverlayHovered: boolean;
    showOverlay: boolean;
    placement: OverlayPlacement;
    arrowPlacement: OverlayArrowPlacement;
}

const initialOverlayState: OverlayState = {
    isTriggerEnabled: true,
    isTriggerHovered: false,
    isOverlayHovered: false,
    showOverlay: false,
    placement: 'bottom',
    arrowPlacement: 'top-center',
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

    const { showOverlay, placement, arrowPlacement } =
        useContext(OverlayContext);
    const stateDispatch = useContext(OverlayDispatchContext);

    const positionStyleClass = useMemo(() => {
        switch (placement) {
            case 'top-span-right':
                return styles.posTopSpanRight;
            case 'top-span-left':
                return styles.posTopSpanLeft;
            case 'top':
                return styles.posTop;
            case 'bottom-span-right':
                return styles.posBottomSpanRight;
            case 'bottom-span-left':
                return styles.posBottomSpanLeft;
            case 'bottom':
                return styles.posBottom;
            case 'left-span-top':
                return styles.posLeftSpanTop;
            case 'left-span-bottom':
                return styles.posLeftSpanBottom;
            case 'left':
                return styles.posLeft;
            case 'right-span-top':
                return styles.posRightSpanTop;
            case 'right-span-bottom':
                return styles.posRightSpanBottom;
            case 'right':
                return styles.posRight;
        }
    }, [placement]);

    const arrowPositionStyleClass = useMemo(() => {
        switch (arrowPlacement) {
            case 'top-left':
                return '-tw-top-2 tw-left-1/4 -tw-translate-x-1/2';
            case 'top-center':
                return '-tw-top-2 tw-left-1/2 -tw-translate-x-1/2';
            case 'top-right':
                return '-tw-top-2 tw-left-3/4 -tw-translate-x-1/2';
            case 'bottom-left':
                return '-tw-bottom-2 tw-left-1/4 -tw-translate-x-1/2';
            case 'bottom-center':
                return '-tw-bottom-2 tw-left-1/2 -tw-translate-x-1/2';
            case 'bottom-right':
                return '-tw-bottom-2 tw-left-3/4 -tw-translate-x-1/2';
            case 'left-top':
                return 'tw-top-1/4 -tw-left-2 -tw-translate-y-1/2';
            case 'left-center':
                return 'tw-top-1/2 -tw-left-2 -tw-translate-y-1/2';
            case 'left-bottom':
                return 'tw-top-3/4 -tw-left-2 -tw-translate-y-1/2';
            case 'right-top':
                return 'tw-top-1/4 -tw-right-2 -tw-translate-y-1/2';
            case 'right-center':
                return 'tw-top-1/2 -tw-right-2 -tw-translate-y-1/2';
            case 'right-bottom':
                return 'tw-top-3/4 -tw-right-2 -tw-translate-y-1/2';
        }
    }, [arrowPlacement]);

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
                // Overflow needs to be visible so that the arrow is visible
                'tw-m-0 tw-overflow-visible',
                styles.overlayOverlay,
                positionStyleClass,
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
            <span
                className={classNames(
                    'tw-absolute tw-block tw-h-4 tw-w-4 tw-rotate-45 tw-bg-gray-900',
                    arrowPositionStyleClass,
                )}
            />
            <div className="tw-overflow-auto tw-bg-gray-900 tw-px-6 tw-py-3 tw-text-white">
                {children}
            </div>
        </Popover>
    );
};

interface OverlayProps
    extends Pick<React.ComponentPropsWithRef<'div'>, 'ref' | 'className'> {
    triggerElem?: OverlayTriggerElem;
    triggerRestraint?: OverlayTriggerRestraint;
    placement?: OverlayPlacement;
    arrowPlacement?: OverlayArrowPlacement;
}

interface OverlayComponent
    extends React.FC<React.PropsWithChildren<OverlayProps>> {
    Trigger: OverlayTriggerComponent;
    Overlay: OverlayOverlayComponent;
}

const Overlay: OverlayComponent = ({
    triggerElem = 'trigger',
    triggerRestraint = 'only-enabled',
    placement = 'bottom',
    arrowPlacement = 'top-center',
    children,
    ...attrs
}) => {
    const [state, stateDispatch] = useReducer(overlayReducer, {
        ...initialOverlayState,
        placement,
        arrowPlacement,
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
                case 'trigger':
                    return state.isTriggerHovered;
                case 'trigger-or-overlay':
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
        <div className={styles.overlayScope} {...attrs}>
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
