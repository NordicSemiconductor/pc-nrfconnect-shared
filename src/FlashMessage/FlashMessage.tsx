/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';

import classNames from '../utils/classNames';
import { colors } from '../utils/colors';
import {
    type FlashMessage,
    getMessages,
    removeMessage,
} from './FlashMessageSlice';

import './FlashMessage.scss';

const SLIDE_IN_DURATION_MS = 300;
const SLIDE_IN_ANIMATION = `${SLIDE_IN_DURATION_MS}ms slide-in`;

const SLIDE_OUT_DURATION_MS = 1000;
const SLIDE_OUT_ANIMATION = (dismissTime: number) =>
    `${SLIDE_OUT_DURATION_MS}ms slide-out ${
        dismissTime - SLIDE_OUT_DURATION_MS
    }ms`;

const LOADER_ANIMATION = (dismissTime: number) =>
    `${
        dismissTime - SLIDE_OUT_DURATION_MS
    }ms flash-message-loader linear forwards`;

const SingleFlashMessage = ({
    flashMessage,
}: {
    flashMessage: FlashMessage;
}) => {
    const { id, message, variant, dismissTime } = flashMessage;

    const dispatch = useDispatch();
    const divRef = useRef(null);
    const [fadeoutTimer, setFadeoutTimer] = useState<string>(
        dismissTime == null ? 'unset' : `${dismissTime}ms`,
    );
    const timeoutHandler = useRef<number | undefined>(undefined);

    if (timeoutHandler.current == null && dismissTime != null) {
        timeoutHandler.current = window.setTimeout(() => {
            dispatch(removeMessage(id));
        }, dismissTime);
    }

    const close = () => {
        clearTimeout(timeoutHandler.current);
        dispatch(removeMessage(id));
    };

    const addFadeout = () => {
        if (dismissTime) {
            timeoutHandler.current = window.setTimeout(() => {
                dispatch(removeMessage(id));
            }, dismissTime);
            setFadeoutTimer(`${dismissTime}ms`);
        }
    };

    const removeFadeout = () => {
        clearTimeout(timeoutHandler.current);
        setFadeoutTimer('unset');
    };

    const initialRender = () => divRef.current == null;

    return (
        <div
            ref={divRef}
            className={`tw-flex tw-w-full tw-flex-col tw-justify-between tw-p-4 tw-text-white ${classNames(
                variant === 'error' && 'tw-bg-red',
                variant === 'success' && 'tw-bg-green',
                variant === 'info' && 'tw-bg-nordicBlue',
                variant === 'warning' && 'tw-bg-orange',
            )}`}
            style={{
                zIndex: 1000,
                animation:
                    fadeoutTimer !== 'unset'
                        ? flashMessageAnimations(initialRender(), dismissTime)
                        : 'unset',
            }}
            onMouseEnter={removeFadeout}
            onMouseLeave={addFadeout}
        >
            <div className="tw-flex tw-w-full tw-justify-between">
                {message}
                <div onClick={close}>
                    <Icon path={mdiClose} size={0.8} />
                </div>
            </div>
            {dismissTime != null ? (
                <div
                    style={{
                        backgroundColor: colors.white,
                        width: 'calc(100% + 32px)',
                        height: '2px',
                        margin: '-16px',
                        marginTop: '8px',
                        animation:
                            fadeoutTimer !== 'unset'
                                ? LOADER_ANIMATION(dismissTime)
                                : 'unset',
                    }}
                />
            ) : null}
        </div>
    );
};

const FlashMessages = () => {
    const messages = useSelector(getMessages);

    if (messages.length === 0) return null;

    return (
        <div
            style={{
                position: 'absolute',
                bottom: '32px',
                right: '16px',
                width: '256px',
                gap: '16px',
                display: 'flex',
                flexDirection: 'column-reverse',
            }}
        >
            {messages.map(flashMessage => (
                <SingleFlashMessage
                    key={flashMessage.id}
                    flashMessage={flashMessage}
                />
            ))}
        </div>
    );
};

const flashMessageAnimations = (
    initialRender2: boolean,
    dismissTime2?: number,
): string => {
    if (!dismissTime2) {
        return initialRender2 ? SLIDE_IN_ANIMATION : 'unset';
    }

    return `${SLIDE_OUT_ANIMATION(dismissTime2)},${
        initialRender2 ? SLIDE_IN_ANIMATION : ''
    }`;
};

export default FlashMessages;
