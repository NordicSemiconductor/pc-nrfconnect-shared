/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import PseudoButton from '../../../PseudoButton/PseudoButton';

import './broken-device.scss';

export default ({
    virtualDevice,
    onSelect,
}: {
    virtualDevice: string;
    onSelect: () => void;
}) => (
    <PseudoButton
        className="tw-flex tw-flex-col tw-gap-2 tw-border-x-0 tw-border-b tw-border-t-0 tw-border-solid tw-border-b-gray-200 tw-py-3 tw-font-light hover:tw-bg-white"
        onClick={onSelect}
    >
        <div className="basic-device-info tw-h-[42px]">
            <div className="icon">Logo</div>
            <div className="details tw-flex tw-flex-col">
                <div className="name">{virtualDevice}</div>
                <div className="serial-number">Virtual Device</div>
            </div>
        </div>
    </PseudoButton>
);
