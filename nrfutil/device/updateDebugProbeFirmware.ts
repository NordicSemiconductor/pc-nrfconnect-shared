/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    clearWaitForDevice,
    setWaitForDevice,
} from '../../src/Device/deviceAutoSelectSlice';
import type { Device } from '../../src/Device/deviceSlice';
import type { AppThunk, RootState } from '../../src/store';
import { Progress } from '../sandboxTypes';
import { deviceSingleTaskEndOperation, NrfutilDevice } from './common';

export interface DebugProgUpdateInfo {
    name: 'update-debug-probe-firmware';
    versionAfterUpdate: string;
    versionBeforeUpdate: string;
}

export const updateOBFirmwareWithWaitForDevice =
    (
        device: Device,
        onProgress?: (progress: Progress) => void,
        controller?: AbortController
    ): AppThunk<RootState, Promise<DebugProgUpdateInfo>> =>
    dispatch =>
        new Promise<DebugProgUpdateInfo>((resolve, reject) => {
            let updateDeviceInfo:
                | (() => AppThunk<RootState, Promise<void>>)
                | undefined;

            dispatch(
                setWaitForDevice({
                    timeout: 30000,
                    when: 'sameTraits',
                    once: false,
                    skipRefetchDeviceInfo: true,
                    onSuccess: (_, updateDevice) => {
                        updateDeviceInfo = updateDevice;
                    },
                    onFail: reason => {
                        dispatch(clearWaitForDevice());
                        reject(reason);
                    },
                })
            );

            updateDebugProbeFirmware(device, onProgress, controller).then(
                async result => {
                    dispatch(clearWaitForDevice());
                    try {
                        if (updateDeviceInfo) {
                            await dispatch(updateDeviceInfo()).then(() =>
                                resolve(result)
                            );
                        } else {
                            resolve(result);
                        }
                    } catch {
                        reject();
                    }
                }
            );
        });

const updateDebugProbeFirmware = (
    device: NrfutilDevice,
    onProgress?: (progress: Progress) => void,
    controller?: AbortController
) =>
    deviceSingleTaskEndOperation<DebugProgUpdateInfo>(
        device,
        'x-update-debug-probe-firmware',
        onProgress,
        controller
    );

export default updateDebugProbeFirmware;
