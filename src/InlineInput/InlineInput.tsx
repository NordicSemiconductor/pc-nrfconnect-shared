/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef, useState } from 'react';

import classNames from '../utils/classNames';

import './inline-input.scss';

/*
This input component is a bit tricky, because it has several constraints:

We want to be able validate the input and indicate to the user whether the current input is
invalid.

Users should be able to enter invalid values, we just want to indicate that they are invalid
and do not use the value unless it is valid. We want to allow users to enter momentarily
invalid values, because forbidding them to do so would be a pain. E.g. if we have a range from
100 to 1000, then entering the number 500 would be hard if the system forbids to just type '5'
because it is below 10).

To accomplish the above we need not just one, but two values: An internal value, which is what
is displayed to the user, can be potentially invalid, and is held in a state local to this
component. Only when this internal value is valid, then onChange is called, which should update
the external value, which is passed in as a prop.

We want to enable other controls to also update the external value and then have it reflect in
this input, so the external value and the internal value need to be synchronised, but the
external value must only overwrite the internal value if the former was changed.
useSynchronisationIfChangedFromOutside does take care of this by remembering the previous
external value and comparing with it to determine whether it has changed.
*/

const useSynchronisationIfChangedFromOutside = (
    externalValue: string,
    setInternalValue: (value: string) => void
) => {
    const previousExternalValue = useRef(externalValue);
    useEffect(() => {
        if (previousExternalValue.current !== externalValue) {
            setInternalValue(externalValue);
            previousExternalValue.current = externalValue;
        }
    });
    return previousExternalValue.current;
};

interface Props {
    disabled?: boolean;
    value: string;
    isValid?: (value: string) => boolean;
    onChange: (value: string) => void;
    onChangeComplete?: (value: string) => void;
    onKeyboardIncrementAction?: () => string;
    onKeyboardDecrementAction?: () => string;
    className?: string;
    textAlignLeft?: boolean;
}

const InlineInput = React.forwardRef<HTMLInputElement, Props>(
    (
        {
            disabled = false,
            value: externalValue,
            isValid = () => true,
            onChange,
            onChangeComplete = () => {},
            onKeyboardIncrementAction = () => externalValue,
            onKeyboardDecrementAction = () => externalValue,
            className = '',
            textAlignLeft = false,
        },
        ref
    ) => {
        const [internalValue, setInternalValue] = useState(externalValue);
        const [initialValue, setInitialValue] = useState(externalValue);
        useSynchronisationIfChangedFromOutside(externalValue, setInternalValue);
        const onChangeIfValid = (newValue: string) => {
            if (disabled) {
                return;
            }

            setInternalValue(newValue);
            if (isValid(newValue)) {
                if (externalValue !== newValue) {
                    onChange(newValue);
                }
            }
        };

        const resetToExternalValueOrOnChangeCompleteIfValid = () => {
            if (disabled) {
                return;
            }

            if (isValid(internalValue)) {
                if (initialValue !== internalValue) {
                    setInitialValue(internalValue);
                    onChangeComplete(internalValue);
                }
            } else {
                setInternalValue(externalValue);
            }
        };

        const onChangeCompleteIfValid = (event: React.KeyboardEvent) => {
            if (disabled) {
                return;
            }

            event.stopPropagation();

            if (event.key === 'Enter' && isValid(internalValue)) {
                if (initialValue !== internalValue) {
                    setInitialValue(internalValue);
                    onChangeComplete(internalValue);
                }
            }
        };

        const startKeyboardEvents = (event: React.KeyboardEvent) => {
            if (disabled) {
                return;
            }

            event.stopPropagation();

            switch (event.key) {
                case 'ArrowUp':
                    onChangeIfValid(onKeyboardIncrementAction());
                    break;
                case 'ArrowDown':
                    onChangeIfValid(onKeyboardDecrementAction());
                    break;
            }
        };
        const stopPropagation = (event: React.MouseEvent) =>
            event.stopPropagation();

        return (
            <input
                ref={ref}
                type="text"
                className={`${classNames(
                    'inline-input',
                    isValid(internalValue) || 'invalid',
                    disabled && 'disabled',
                    className
                )} ${textAlignLeft && 'tw-pl-2 tw-text-left'}`}
                size={
                    Math.max(1, internalValue.length) +
                    (process.platform === 'darwin' ? 2 : 0)
                }
                disabled={disabled}
                value={internalValue}
                onFocus={() => {
                    setInitialValue(internalValue);
                }}
                onChange={event => onChangeIfValid(event.target.value)}
                onBlur={resetToExternalValueOrOnChangeCompleteIfValid}
                onKeyUp={onChangeCompleteIfValid}
                onKeyDown={startKeyboardEvents}
                onClick={stopPropagation}
            />
        );
    }
);

export default InlineInput;
