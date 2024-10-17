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
import classNames from '../utils/classNames';
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
    const [activeSettings, setSettings] =
        useState<SerialPortOpenOptions<AutoDetectTypes>>();

    useEffect(() => {
        if (isVisible) {
            getCurrentOptions(localSettings.path, setSettings);
        }
    }, [isVisible, localSettings.path]);

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
                    'Port could not be opened. Verify it is not used by other applications.'
                );
            }
        }
    };

    return (
        <ConfirmationDialog
            title={`Conflicting Serial Settings for ${localSettings.path}`}
            isVisible={isVisible}
            size="lg"
            className="tw-preflight"
            onCancel={onCancel}
            optionalLabel="Overwrite with Selected"
            onOptional={onOverwrite}
            confirmLabel="Continue with Active"
            onConfirm={() => {
                onCancel();
                if (activeSettings) {
                    connectToSelectedSerialPort(true, activeSettings);
                } else {
                    logger.error(
                        'Could not get the active serial port settings.'
                    );
                }
            }}
        >
            <div className="tw-flex tw-flex-col tw-gap-4">
                <p>
                    You are about to connect to{' '}
                    <code>{localSettings.path}</code>. This port is already
                    active with different serial settings - most likely it is
                    opened by another nRF Connect app running on your computer.
                </p>
                <p>
                    You may continue with the active serial port settings or
                    choose to overwrite these with the settings you have
                    selected. If you choose to overwrite the active settings,
                    the port will be closed and reopened with the new settings.
                    Alternatively, you can close the port in the other app and
                    try again.
                </p>
                <p>
                    The serial settings depend on the attached device and
                    it&apos;s embedded application, and normally the serial port
                    settings for all nRF Connect apps should be the same for a
                    given serial port.
                </p>
                <DisplayConflictingSettings
                    activeSettings={activeSettings}
                    localSettings={localSettings}
                />
            </div>
        </ConfirmationDialog>
    );
};

type DisplayConflictingSettings = {
    activeSettings?: SerialPortOpenOptions<AutoDetectTypes>;
    localSettings: SerialPortOpenOptions<AutoDetectTypes>;
};

const DisplayConflictingSettings = ({
    activeSettings,
    localSettings,
}: DisplayConflictingSettings) => {
    const allKeys = Object.keys(localSettings);
    if (activeSettings) {
        Object.keys(activeSettings).forEach(key => {
            if (!allKeys.includes(key)) {
                allKeys.push(key);
            }
        });
    }
    allKeys.splice(allKeys.indexOf('path'), 1);

    const conflictingSettings = activeSettings
        ? allKeys.filter(
              key =>
                  activeSettings[key as keyof typeof activeSettings] !==
                  localSettings[key as keyof typeof localSettings]
          )
        : [];

    return (
        <div className="tw-preflight tw-my-4 tw-flex tw-w-full tw-justify-start">
            <div className="tw-pr-7">
                {activeSettings ? (
                    <ul>
                        <li className="tw-p-1 tw-font-bold">Active settings</li>
                        {allKeys.map(key => (
                            <li
                                key={key}
                                className={`tw-p-1 ${classNames(
                                    conflictingSettings.includes(key)
                                        ? 'tw-bg-red-100'
                                        : 'tw-bg-green-100'
                                )}`}
                            >
                                <span className="tw-font-semibold">{`${key}: `}</span>
                                {prettifyValue(
                                    activeSettings[
                                        key as keyof typeof activeSettings
                                    ]
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Could not retrieve the current settings.</p>
                )}
            </div>
            <div className="tw-pr-7">
                <ul>
                    <li className="tw-p-1 tw-font-bold">Selected settings</li>
                    {allKeys.map(key => (
                        <li
                            className={`tw-p-1 ${classNames(
                                conflictingSettings.includes(key)
                                    ? 'tw-bg-red-100'
                                    : 'tw-bg-green-100'
                            )}`}
                            key={key}
                        >
                            <span className="tw-font-semibold">{`${key}: `}</span>
                            {prettifyValue(
                                localSettings[key as keyof typeof localSettings]
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const prettifyValue = (value: unknown) => {
    if (typeof value === 'boolean') {
        return value ? 'on' : 'off';
    }

    if (typeof value === 'string' || typeof value === 'number') {
        return value;
    }

    if (value == null) {
        return 'N/A';
    }

    return JSON.stringify(value);
};

export default ConflictingSettingsDialog;
