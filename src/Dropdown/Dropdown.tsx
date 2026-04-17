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

import Popover, { type PopoverProps } from '../Popover/Popover';
import classNames from '../utils/classNames';
import { signedRatio } from '../utils/signedRatio';

import styles from './Dropdown.module.scss';

export interface DropdownItem<T = string> {
    label: React.ReactNode;
    value: T;
}

type DropdownSize = 'sm' | 'md';

type MenuPosition = 'bottom' | 'top';

interface DropdownState<T = string> {
    dropdownSize: DropdownSize;
    isMenuActive: boolean;
    menuPos: MenuPosition;
    menuMaxHeight: number;
    items: Map<string, DropdownItem<T>>;
    selectedItem: DropdownItem<T> | null;
    toggleRef?: React.RefObject<HTMLElement | null>;
    menuRef?: React.RefObject<HTMLDialogElement | null>;
}

const initialDropdownState: DropdownState = {
    dropdownSize: 'md',
    isMenuActive: false,
    menuPos: 'bottom',
    menuMaxHeight: 100,
    items: new Map(),
    selectedItem: null,
};

interface DropdownSetMenuActiveAction {
    type: 'setMenuActive';
    isMenuActive: DropdownState['isMenuActive'];
}

interface DropdownSetMenuPosAction {
    type: 'setMenuPos';
    menuPos: DropdownState['menuPos'];
}

interface DropdownSetMenuMaxHeightAction {
    type: 'setMenuMaxHeight';
    menuMaxHeight: DropdownState['menuMaxHeight'];
}

interface DropdownAddItemAction<T = string> {
    type: 'addItem';
    item: DropdownState<T>['items'] extends Map<infer _K, infer Item>
        ? Item
        : never;
}

interface DropdownRemoveItemAction<T = string> {
    type: 'removeItem';
    key: DropdownState<T>['items'] extends Map<infer K, infer _Item>
        ? K
        : never;
}

interface DropdownSelectItemAction<T = string> {
    type: 'selectItem';
    selectedItem: DropdownState<T>['selectedItem'];
}

interface DropdownSetToggleRefAction {
    type: 'setToggleRef';
    toggleRef: DropdownState['toggleRef'];
}

interface DropdownSetMenuRefAction {
    type: 'setMenuRef';
    menuRef: DropdownState['menuRef'];
}

type DropdownAction<T = string> =
    | DropdownSetMenuActiveAction
    | DropdownSetMenuPosAction
    | DropdownSetMenuMaxHeightAction
    | DropdownAddItemAction<T>
    | DropdownRemoveItemAction<T>
    | DropdownSelectItemAction<T>
    | DropdownSetToggleRefAction
    | DropdownSetMenuRefAction;

// Since we are not in a scope were the generic types are defined,
// we set them to `unknown` but guarantee consistency over T in and out.
export const DropdownContext =
    createContext<DropdownState<unknown>>(initialDropdownState);
export const DropdownDispatchContext = createContext<React.ActionDispatch<
    [DropdownAction<unknown>]
> | null>(null);

const dropdownReducer: React.Reducer<
    DropdownState<unknown>,
    DropdownAction<unknown>
> = (state, action) => {
    switch (action.type) {
        case 'setMenuActive':
            return {
                ...state,
                isMenuActive: action.isMenuActive,
            };
        case 'setMenuPos':
            return {
                ...state,
                menuPos: action.menuPos,
            };
        case 'setMenuMaxHeight':
            return {
                ...state,
                menuMaxHeight: action.menuMaxHeight,
            };
        case 'addItem': {
            // React frowns upon mutating the old state, so we do a clone
            const clonedItems = structuredClone(state.items);
            clonedItems.set(JSON.stringify(action.item.value), action.item);

            return {
                ...state,
                items: clonedItems,
            };
        }
        case 'removeItem': {
            // React frowns upon mutating the old state, so we do a clone
            const clonedItems = structuredClone(state.items);
            clonedItems.delete(action.key);

            return {
                ...state,
                items: clonedItems,
            };
        }
        case 'selectItem':
            return {
                ...state,
                selectedItem: action.selectedItem,
            };
        case 'setToggleRef':
            return {
                ...state,
                toggleRef: action.toggleRef,
            };
        case 'setMenuRef':
            return {
                ...state,
                menuRef: action.menuRef,
            };
    }
};

interface DropdownToggleButtonProps
    extends Pick<
        React.ComponentPropsWithRef<'button'>,
        'className' | 'id' | 'title' | 'disabled'
    > {
    label?: React.ReactNode;
    btnDefaultText?: string;
    transparentButtonBg?: boolean;
    minWidth?: boolean;
}

type DropdownToggleButtonComponent = React.FC<DropdownToggleButtonProps>;

const DropdownToggleButton: DropdownToggleButtonComponent = ({
    id,
    label,
    btnDefaultText = '',
    transparentButtonBg = false,
    minWidth = false,
    className,
    ...attrs
}) => {
    const { isMenuActive, items, selectedItem, dropdownSize } =
        useContext(DropdownContext);
    const dispatch = useContext(DropdownDispatchContext);

    const toggleRef = useRef<HTMLButtonElement>(null);
    dispatch?.({ type: 'setToggleRef', toggleRef });

    return (
        <>
            {label && (
                <label className="tw-text-xs" htmlFor={id}>
                    {label}
                </label>
            )}
            <button
                id={id}
                ref={toggleRef}
                type="button"
                className={classNames(
                    'tw-flex tw-items-center tw-justify-between tw-border-0',
                    styles.anchor,
                    minWidth && 'tw-min-w-12',
                    transparentButtonBg
                        ? 'tw-bg-transparent'
                        : classNames(
                              'tw-bg-gray-700 tw-text-white',
                              dropdownSize === 'sm' &&
                                  'tw-h-6 tw-pl-2 tw-pr-1 tw-text-2xs',
                              dropdownSize === 'md' && 'tw-h-8 tw-px-2',
                          ),
                    className,
                )}
                onClick={() =>
                    dispatch?.({
                        type: 'setMenuActive',
                        isMenuActive: !isMenuActive,
                    })
                }
                {...attrs}
            >
                <span className="tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap">
                    {selectedItem &&
                    items.has(JSON.stringify(selectedItem.value))
                        ? selectedItem.label
                        : btnDefaultText}
                </span>
                <span
                    className={`mdi mdi-chevron-down ${classNames(
                        isMenuActive && 'tw-rotate-180',
                        dropdownSize === 'sm' && 'tw-text-base',
                        dropdownSize === 'md' && 'tw-text-lg/none',
                    )}`}
                />
            </button>
        </>
    );
};

interface DropdownMenuItemProps<T>
    extends Pick<
        React.ComponentPropsWithRef<'button'>,
        'ref' | 'key' | 'className'
    > {
    dataValue: T;
    children: string;
}

interface DropdownMenuItemComponent {
    <T>(props: DropdownMenuItemProps<T>): ReturnType<React.FC>;
}

const DropdownMenuItem: DropdownMenuItemComponent = ({
    dataValue,
    children,
    ...attrs
}) => {
    const { id: menuId } = useContext(DropdownMenuContext);
    const { dropdownSize } = useContext(DropdownContext);
    const dispatch = useContext(DropdownDispatchContext);

    const item: DropdownItem<typeof dataValue> = {
        label: children,
        value: dataValue,
    };

    return (
        <button
            type="button"
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            // eslint-disable-next-line react/no-unknown-property
            command="hide-popover"
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            // eslint-disable-next-line react/no-unknown-property
            commandfor={menuId}
            className={classNames(
                'tw-h-6 tw-whitespace-nowrap tw-border-0 tw-bg-transparent tw-px-2 tw-py-1 tw-text-left tw-font-normal tw-text-white hover:tw-bg-gray-600 focus:tw-bg-gray-600',
                dropdownSize === 'sm' && 'tw-text-2xs',
            )}
            onClick={() =>
                dispatch?.({ type: 'selectItem', selectedItem: item })
            }
            {...attrs}
        >
            {children}
        </button>
    );
};

interface DropdownMenuState {
    id?: string;
}

const DropdownMenuContext = createContext<DropdownMenuState>({});

interface DropdownMenuProps<T> extends Pick<PopoverProps, 'className'> {
    selectedItem?: DropdownItem<T>;
    onSelect?: (item: DropdownItem<T>) => void;
}

interface DropdownMenuComponent {
    <T>(
        props: React.PropsWithChildren<DropdownMenuProps<T>>,
    ): ReturnType<React.FC>;
    Item: DropdownMenuItemComponent;
}

const DropdownMenu: DropdownMenuComponent = ({
    onSelect,
    className,
    children,
    ...attrs
}) => {
    const { menuPos, selectedItem } = useContext(DropdownContext);
    const dispatch = useContext(DropdownDispatchContext);

    const menuId = useId();
    const menuContext = useMemo<DropdownMenuState>(
        () => ({ id: menuId }),
        [menuId],
    );

    const menuRef = useRef<HTMLDialogElement>(null);
    dispatch?.({ type: 'setMenuRef', menuRef });

    useEffect(() => {
        if (selectedItem) {
            onSelect?.(selectedItem as DropdownItem<a>);
        }
    }, [selectedItem, onSelect]);

    return (
        <DropdownMenuContext.Provider value={menuContext}>
            <Popover
                id={menuId}
                ref={menuRef}
                closingBehavior="hint"
                className={classNames(
                    'tw-absolute tw-m-0 tw-overflow-y-auto tw-border-2 tw-border-solid tw-border-gray-600 tw-bg-gray-700 tw-text-white [&:popover-open]:tw-flex [&:popover-open]:tw-flex-col',
                    styles.anchoredPopover,
                    menuPos === 'bottom' && 'tw-bottom-auto',
                    menuPos === 'top' && 'tw-top-auto',
                    className,
                )}
                onToggle={ev => {
                    switch (ev.newState) {
                        case 'open':
                            dispatch?.({
                                type: 'setMenuActive',
                                isMenuActive: true,
                            });
                            break;
                        case 'closed':
                            dispatch?.({
                                type: 'setMenuActive',
                                isMenuActive: false,
                            });
                            break;
                    }
                }}
                {...attrs}
            >
                {children}
            </Popover>
        </DropdownMenuContext.Provider>
    );
};

DropdownMenu.Item = DropdownMenuItem;

interface DropdownProps
    extends Pick<React.ComponentPropsWithRef<'div'>, 'ref' | 'className'> {
    size?: DropdownSize;
}

interface DropdownComponent
    extends React.FC<React.PropsWithChildren<DropdownProps>> {
    ToggleButton: DropdownToggleButtonComponent;
    Menu: DropdownMenuComponent;
}

const Dropdown: DropdownComponent = ({
    size = 'md',
    className,
    children,
    ...attrs
}) => {
    const intersectionObs = useRef<IntersectionObserver>(null);

    const [state, dispatch] = useReducer(dropdownReducer, {
        ...initialDropdownState,
        dropdownSize: size,
    });

    const onChange = useCallback(() => {
        if (
            !state.toggleRef?.current ||
            !state.menuRef?.current?.checkVisibility()
        ) {
            return;
        }

        const toggleRect = state.toggleRef.current.getBoundingClientRect();

        const rootRect = new DOMRect(
            window.scrollX,
            window.scrollY,
            document.documentElement.clientWidth,
            document.documentElement.clientHeight,
        );

        const distanceToViewportTop = Math.trunc(toggleRect.top - rootRect.top);
        const distanceToViewportBottom = Math.trunc(
            rootRect.bottom - toggleRect.bottom,
        );

        const placeDropdownAtTop = () => {
            dispatch({ type: 'setMenuPos', menuPos: 'top' });
            dispatch({
                type: 'setMenuMaxHeight',
                menuMaxHeight: distanceToViewportTop,
            });
        };
        const placeDropdownAtBottom = () => {
            dispatch({ type: 'setMenuPos', menuPos: 'bottom' });
            dispatch({
                type: 'setMenuMaxHeight',
                menuMaxHeight: distanceToViewportBottom,
            });
        };

        // Early returns
        if (distanceToViewportTop <= 0) {
            placeDropdownAtBottom();
            return;
        }

        if (distanceToViewportBottom <= 0) {
            placeDropdownAtTop();
            return;
        }

        const dropdownPopoverComputedStyleValues = window.getComputedStyle(
            state.menuRef.current,
        );

        // Since our dropdown can be scrollable, here we want to know its
        // full height of border box, not just the height of what's visible.
        // ACK: Used CSS values are strings ending in `px` for lengths and we
        // pass it directly to `parseFloat`, that's because `parseFloat`
        // will ignore any "unparseable" characters after the parseable number.
        // This is not very elegant, but there's no method to cleanly retrieve
        // the border box of an element, including its overflow ("scroll height")
        const dropdownPopoverHeight = Math.trunc(
            state.menuRef.current.scrollHeight +
                parseFloat(dropdownPopoverComputedStyleValues.borderTop) +
                parseFloat(dropdownPopoverComputedStyleValues.borderBottom),
        );

        // Enough space to fit the dropdown without scroll
        if (distanceToViewportBottom >= dropdownPopoverHeight) {
            placeDropdownAtBottom();
            return;
        }

        if (distanceToViewportTop >= dropdownPopoverHeight) {
            placeDropdownAtTop();
            return;
        }

        // Thereafter, neither top nor bottom has enough space to fit the dropdown,
        // so we instead refer to an arbitrary 15% preference of bottom placement
        // over top placement
        const bottomPreference = 0.15;
        const topBottomRatio =
            Math.trunc(
                20 *
                    signedRatio(
                        distanceToViewportTop,
                        distanceToViewportBottom,
                    ),
            ) / 20; // Smoothes out floating point errors (step = 0.05)

        if (topBottomRatio <= bottomPreference) {
            placeDropdownAtBottom();
        } else {
            placeDropdownAtTop();
        }
    }, [state.toggleRef, state.menuRef, dispatch]);

    useEffect(() => {
        switch (state.menuPos) {
            case 'bottom':
                state.menuRef?.current?.classList.remove(styles.anchorToTop);
                state.menuRef?.current?.classList.add(styles.anchorToBottom);
                break;
            case 'top':
                state.menuRef?.current?.classList.remove(styles.anchorToBottom);
                state.menuRef?.current?.classList.add(styles.anchorToTop);
                break;
        }
    }, [state.menuPos, state.menuRef]);

    useEffect(() => {
        // This prevents the dropdown from overflowing past the viewport,
        // allowing the user to scroll the list.
        // The list will become visible if window scrolling makes the entire
        // list visible.
        state.menuRef?.current?.style.setProperty(
            'max-height',
            `${state.menuMaxHeight}px`,
        );
    }, [state.menuMaxHeight, state.menuRef]);

    // Setup/Cleanup scroll observer and window resizing observer
    useEffect(() => {
        intersectionObs.current = new IntersectionObserver(() => {
            onChange();
        });

        const resizeEventHandler = () => {
            onChange();
        };

        window.addEventListener('resize', resizeEventHandler);

        return () => {
            intersectionObs.current = null;
            window.removeEventListener('resize', resizeEventHandler);
        };
    }, [onChange]);

    // Start/Stop observing dropdown for scroll
    useEffect(() => {
        // See https://stackoverflow.com/questions/67069827/cleanup-ref-issues-in-react
        let observed = null;

        if (state.toggleRef?.current && intersectionObs.current) {
            observed = state.toggleRef.current;
            intersectionObs.current?.observe(observed);
        }

        return () => {
            if (observed && intersectionObs.current) {
                intersectionObs.current.unobserve(observed);
            }
        };
    }, [intersectionObs, state.toggleRef]);

    // Watch for property changes that may affect the dropdown's height (items)
    useEffect(() => {
        onChange();
    }, [state.items, onChange]);

    useEffect(() => {
        // Manual popover control is mainly for the dropdown button
        // Otherwise the popover and the buttons in the dropdown manage
        // the popover's state through HTML `command` attribute
        if (state.isMenuActive) {
            if (!state.menuRef?.current?.open) {
                state.menuRef?.current?.showPopover();
                onChange();
            }
        } else if (state.menuRef?.current?.open) {
            state.menuRef?.current?.hidePopover();
        }
    }, [state.isMenuActive, state.menuRef, onChange]);

    return (
        <div className={classNames('tw-preflight', className)} {...attrs}>
            <DropdownContext.Provider value={state}>
                <DropdownDispatchContext value={dispatch}>
                    {children}
                </DropdownDispatchContext>
            </DropdownContext.Provider>
        </div>
    );
};

Dropdown.ToggleButton = DropdownToggleButton;
Dropdown.Menu = DropdownMenu;

export default Dropdown;
