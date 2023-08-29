/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { handle, invoke } from './infrastructure/rendererToMain';

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

type EncryptString = (plainText: string) => Buffer;
const encryptString = invoke<EncryptString>(channel.encryptString);
const registerEncryptString = handle<EncryptString>(channel.encryptString);

type DecryptString = (encrypted: Buffer) => string;
const decryptString = invoke<DecryptString>(channel.decryptString);
const registerDecryptString = handle<DecryptString>(channel.decryptString);

export const forRenderer = {
    registerEncryptionAvailable,
    registerEncryptString,
    registerDecryptString,
};
export const inMain = { isEncryptionAvailable, encryptString, decryptString };
