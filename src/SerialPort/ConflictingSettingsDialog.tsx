/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import { SerialPortOpenOptions } from 'serialport';

import { ConfirmationDialog } from '../Dialog/Dialog';
import logger from '../logging';
import {
    createSerialPort,
    getSerialPortOptions,
    SerialPort,
} from './SerialPort';

const getCurrentOptions = async (
    portPath: string,
    setSettings: (options: SerialPortOpenOptions<AutoDetectTypes>) => void
) => {
    try {
        const options = await getSerialPortOptions(portPath);
        if (options) {
            setSettings(options);
        }
    } catch (err) {
        console.error(err);
    }
};

interface ConflictingSettingsDialog {
    isVisible: boolean;
    onOverwrite: () => void;
    onCancel: () => void;
    localSettings: SerialPortOpenOptions<AutoDetectTypes>;
    setSerialPortCallback: (serialPort: SerialPort) => void;
}

const ConflictingSettingsDialog = ({
    isVisible,
    onOverwrite,
    onCancel,
    localSettings,
    setSerialPortCallback,
}: ConflictingSettingsDialog) => {
    const [appliedSettings, setSettings] =
        useState<SerialPortOpenOptions<AutoDetectTypes>>();

    useEffect(() => {
        if (!appliedSettings) {
            getCurrentOptions(localSettings.path, setSettings);
        }
    }, [isVisible, appliedSettings, localSettings.path]);

    const connectToSelectedSerialPort = async (
        overwrite: boolean,
        newSettings: SerialPortOpenOptions<AutoDetectTypes>
    ) => {
        try {
            const port = await createSerialPort(newSettings, {
                overwrite,
                settingsLocked: false,
            });
            setSerialPortCallback(port);
        } catch (error) {
            const msg = (error as Error).message;
            if (msg.includes('FAILED_DIFFERENT_SETTINGS')) {
                onCancel();
            } else {
                console.error(
                    'Port could not be opened. Verify it is not used by some other applications'
                );
            }
        }
    };

    return (
        <ConfirmationDialog
            title={`Conflicting Serial Settings for ${localSettings.path}`}
            isVisible={isVisible}
            size="lg"
            onCancel={onCancel}
            optionalLabel="Continue by overwriting settings"
            onOptional={onOverwrite}
            confirmLabel="Continue with active settings"
            onConfirm={() => {
                onCancel();
                if (appliedSettings) {
                    connectToSelectedSerialPort(true, appliedSettings);
                } else {
                    logger.error(
                        'Could not get the active serial port settings.'
                    );
                }
            }}
        >
            <p>
                You are about to connect to {localSettings.path}. This port is
                already active with different serial settings - most likely it
                is opened by another nRF Connect app running on your computer.
            </p>
            <p>
                You may continue with the active serial port settings or choose
                to overwrite these with the settings you have selected. If you
                choose to overwrite the active settings, the port will be closed
                and reopened with the new settings. Alternatively, you can close
                the port in the other app and try again.
            </p>

            <DisplayConflictingSettings
                appliedSettings={appliedSettings}
                localSettings={localSettings}
            />
        </ConfirmationDialog>
    );
};

type DisplayConflictingSettings = {
    appliedSettings?: SerialPortOpenOptions<AutoDetectTypes>;
    localSettings: SerialPortOpenOptions<AutoDetectTypes>;
};

const DisplayConflictingSettings = ({
    appliedSettings,
    localSettings,
}: DisplayConflictingSettings) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conflictingSettings: { [key: string]: any } = {};
    if (appliedSettings) {
        Object.entries(appliedSettings).forEach(([key, value]) => {
            if (
                localSettings[
                    key as keyof SerialPortOpenOptions<AutoDetectTypes>
                ] !== value
            ) {
                conflictingSettings[key] = value;
            }
        });
        Object.entries(localSettings).forEach(([key, value]) => {
            if (
                appliedSettings[
                    key as keyof SerialPortOpenOptions<AutoDetectTypes>
                ] !== value
            ) {
                conflictingSettings[key] = value;
            }
        });
    }

    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-around',
            }}
        >
            <div>
                <h4>Applied settings</h4>
                {appliedSettings ? (
                    <ul style={listStyle}>
                        {Object.entries(appliedSettings).map(([key, value]) => (
                            <li key={key}>
                                {key}: {JSON.stringify(value)}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Could not retrieve the current settings</p>
                )}
            </div>
            <div>
                <h4>Serial Terminal settings</h4>
                <p>
                    <ul style={listStyle}>
                        {Object.entries(localSettings).map(([key, value]) => (
                            <li key={key}>
                                {key}: {JSON.stringify(value)}
                            </li>
                        ))}
                    </ul>
                </p>
            </div>
            <div>
                <h4>Conflicting settings</h4>
                {Object.entries(conflictingSettings).length > 0 ? (
                    <ul style={listStyle}>
                        {Object.entries(conflictingSettings).map(
                            ([key, value]) => (
                                <li key={key}>
                                    {key}: {JSON.stringify(value)}
                                </li>
                            )
                        )}
                    </ul>
                ) : (
                    <p>Could not find the conflicting settings</p>
                )}
            </div>
        </div>
    );
};

export default ConflictingSettingsDialog;

const listStyle: React.CSSProperties = {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
};
