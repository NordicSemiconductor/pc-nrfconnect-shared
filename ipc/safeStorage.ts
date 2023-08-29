/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { handle, invoke, on } from './infrastructure/rendererToMain';

const channel = {
    encryptionAvailable: 'safe-storage:encryptionAvailable',
    encryptString: 'safe-storage:encryptString',
    decryptString: 'safe-storage:decryptString',
};

type EncryptionAvailable = () => boolean;
const isEncryptionAvailable = invoke<EncryptionAvailable>(
    channel.encryptionAvailable
);
const registerEncryptionAvailable = handle<EncryptionAvailable>(
    channel.encryptionAvailable
);

type EncryptString = (plainText: string) => string;
const encryptString = invoke<EncryptString>(channel.encryptString);
const registerEncryptString = on<EncryptString>(channel.encryptString);

type DecryptString = (encryptedString: string) => string;
const decryptString = invoke<DecryptString>(channel.decryptString);
const registerDecryptString = on<DecryptString>(channel.decryptString);

export const forRenderer = {
    registerEncryptionAvailable,
    registerEncryptString,
    registerDecryptString,
};
export const inMain = { isEncryptionAvailable, encryptString, decryptString };
