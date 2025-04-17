/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { inMain as open } from '../../ipc/open';

const openFile = open.openFile;
const openUrl = open.openUrl;
const openFileLocation = open.openFileLocation;

export { openFile, openUrl, openFileLocation };
