/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { bool, shape, string } from 'prop-types';

export default shape({
    serialNumber: string.isRequired,
    nickname: string.isRequired,
    favorite: bool.isRequired,
    boardVersion: string,
    usb: shape({
        product: string,
    }),
});
