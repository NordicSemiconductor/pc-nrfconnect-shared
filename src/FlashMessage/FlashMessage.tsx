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

import { colors } from '../utils/colors';
import {
    FlashMessage,
    FlashMessageVariant,
    getMessages,
    removeMessage,
} from './FlashMessageSlice';

import './flashMessage.css';

interface FlashMessageProps {
    flashMessage: FlashMessage;
}

const FlashMessage = ({ flashMessage }: FlashMessageProps) => {
    const { id, message, variant, dismissTime } = flashMessage;

    const dispatch = useDispatch();
    const divRef = useRef(null);
    const [fadeoutTimer, setFadeoutTimer] = useState<string>(
        dismissTime == null ? 'unset' : `${dismissTime}ms`
    );
    const timeoutHandler = useRef<NodeJS.Timeout | undefined>(undefined);

    if (timeoutHandler.current == null && dismissTime != null) {
        timeoutHandler.current = setTimeout(() => {
            dispatch(removeMessage(id));
        }, dismissTime);
    }

    const close = () => {
        clearTimeout(timeoutHandler.current);
        dispatch(removeMessage(id));
    };

    const addFadeout = () => {
        if (dismissTime) {
            timeoutHandler.current = setTimeout(() => {
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
            style={{
                backgroundColor: getBackgroundColorFromVariant(variant),
                color: colors.white,
                zIndex: 1000,
                animation: initialRender() ? 'slide-in 1s' : 'unset',
                width: '100%',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
            onMouseEnter={removeFadeout}
            onMouseLeave={addFadeout}
        >
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
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
                                ? `flash-message ${dismissTime}ms linear`
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
                <FlashMessage
                    key={flashMessage.id}
                    flashMessage={flashMessage}
                />
            ))}
        </div>
    );
};

const getBackgroundColorFromVariant = (variant: FlashMessageVariant) => {
    switch (variant) {
        case 'error':
            return colors.red;
        case 'success':
            return colors.green;
        case 'info':
            return colors.nordicBlue;
        case 'warning':
            return colors.orange;

        default:
            return '' as never;
    }
};
export default FlashMessages;
