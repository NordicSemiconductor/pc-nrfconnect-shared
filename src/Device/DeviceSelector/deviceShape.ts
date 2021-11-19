/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { bool, InferProps, shape, string } from 'prop-types';

export type DeviceShapeProps = InferProps<typeof deviceShape>;

const deviceShape = shape({
    serialNumber: string.isRequired,
    nickname: string.isRequired,
    favorite: bool.isRequired,
    boardVersion: string,
    usb: shape({
        product: string,
    }),
});

export default deviceShape;
