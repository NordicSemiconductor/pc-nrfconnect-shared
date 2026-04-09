/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, {
    createContext,
    useContext,
    useEffect,
    useId,
    useRef,
    useState,
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

type OverlayBaseProps = Pick<
    React.ComponentPropsWithRef<'div'>,
    'ref' | 'className'
>;

type OverlayBaseComponent = React.FC<React.PropsWithChildren<OverlayBaseProps>>;

const OverlayBase: OverlayBaseComponent = ({
    className,
    children,
    ...attrs
}) => {
    const { setIsBaseHovered, setIsBaseEnabled } = useContext(OverlayContext);

    setIsBaseEnabled?.(isElementEnabled(children));

    return (
        <div
            className={classNames(
                'tw-cursor-help',
                styles.overlayBase,
                className,
            )}
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

    const { setIsOverlayHovered, showOverlay, placement } =
        useContext(OverlayContext);

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
            if (!overlayRef.current?.open) {
                overlayRef.current?.showPopover();
            }
        } else if (overlayRef.current?.open) {
            overlayRef.current?.hidePopover();
        }
    }, [overlayRef, showOverlay]);

    return (
        <Popover
            id={`${useId()}-overlay`}
            ref={overlayRef}
            closingBehavior="manual"
            className={classNames(
                'tw-inset-1',
                styles.overlayOverlay,
                positionAreaStyle,
                className,
            )}
            onMouseEnter={() => {
                setIsOverlayHovered?.(true);
            }}
            onMouseLeave={() => {
                setIsOverlayHovered?.(false);
            }}
            // onClick={e => e.stopPropagation()}
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
    placement: OverlayPlacement;
}

const OverlayContext = createContext<OverlayContextTy>({
    showOverlay: false,
    placement: 'bottom',
});

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

    const showOverlayDebounce: React.RefObject<_.DebouncedFunc<
        () => void
    > | null> = useRef(null);

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

        if (satisfiesTriggerElem() && satisfiesTriggerRestraint()) {
            showOverlayDebounce.current = _.debounce(
                () => setShowOverlay(true),
                500,
                { leading: false, trailing: true },
            );
        } else {
            showOverlayDebounce.current?.cancel();
        }
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
                    placement,
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
