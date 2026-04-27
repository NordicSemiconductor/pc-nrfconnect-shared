/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useId, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentWindow } from '@electron/remote';

import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import { type AppDispatch } from '../store';
import {
    addConfirmBeforeClose,
    clearConfirmBeforeClose,
    type ConfirmBeforeCloseApp,
    getNextConfirmDialog,
    getShowConfirmCloseDialog,
    setShowCloseDialog,
} from './confirmBeforeCloseSlice';

export default () => {
    const dispatch = useDispatch<AppDispatch>();
    const [confirmedDialogs, setConfirmedDialogs] = useState<
        ConfirmBeforeCloseApp[]
    >([]);

    const showCloseDialog = useSelector(getShowConfirmCloseDialog);
    const nextConfirmDialog = useSelector(getNextConfirmDialog);

    useEffect(() => {
        if (!nextConfirmDialog && showCloseDialog) {
            confirmedDialogs.forEach(confirmedDialog => {
                if (confirmedDialog.onClose) confirmedDialog.onClose();
            });
            setConfirmedDialogs([]);
            getCurrentWindow().close();
        }
    }, [nextConfirmDialog, dispatch, showCloseDialog, confirmedDialogs]);

    useEffect(() => {
        const action = (ev: BeforeUnloadEvent) =>
            dispatch((_, getState) => {
                const hasToGetExplicitConform =
                    getState().confirmBeforeCloseDialog.confirmCloseApp.length >
                    0;
                if (hasToGetExplicitConform) {
                    dispatch(setShowCloseDialog(true));
                    ev.returnValue = true;
                }
            });

        window.addEventListener('beforeunload', action, true);

        return () => {
            window.removeEventListener('beforeunload', action);
        };
    }, [dispatch]);

    const id = `${useId()}-modal`;

    return (
        <ConfirmationModal
            id={id}
            closingBehavior="manual"
            headerIcon="alert-outline"
            title={nextConfirmDialog?.title ?? ''}
            overrideModalState={
                showCloseDialog && !!nextConfirmDialog ? 'open' : 'force-close'
            }
            onConfirmPrompt={() => {
                if (nextConfirmDialog) {
                    setConfirmedDialogs([
                        ...confirmedDialogs,
                        nextConfirmDialog,
                    ]);
                    dispatch(clearConfirmBeforeClose(nextConfirmDialog.id));
                }
            }}
            onCancelPrompt={() => {
                getCurrentWindow().emit('restart-cancelled');
                dispatch(setShowCloseDialog(false));
                confirmedDialogs.forEach(confirmedDialog =>
                    dispatch(addConfirmBeforeClose(confirmedDialog)),
                );
                setConfirmedDialogs([]);
            }}
        >
            {nextConfirmDialog?.message}
        </ConfirmationModal>
    );
};
