/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import ExternalLink from '../Link/ExternalLink';
import logger from '../logging/index';

export const Box = ({
    mdiIcon,
    color,
    title,
    content,
}: {
    mdiIcon: string;
    color: string;
    title: string;
    content: React.ReactNode;
}) => (
    <div className="tw-flex tw-flex-row tw-items-center tw-gap-4 tw-bg-gray-50 tw-p-4 tw-text-gray-700">
        <span
            className={`mdi ${mdiIcon} ${color} tw-align-middle tw-text-4xl/9`}
        />
        <div>
            <b>{title}</b>
            {content}
        </div>
    </div>
);

export const ErrorContent = () => (
    <p>
        Contact support on{' '}
        <ExternalLink
            href="https://devzone.nordicsemi.com/support/add"
            label="DevZone"
        />{' '}
        and provide the{' '}
        <button
            type="button"
            className="tw-inline tw-h-min tw-p-0 tw-text-primary"
            onClick={() => logger.openLogFileLocation()}
        >
            <span className="mdi mdi-text-box tw-mr-0.5 tw-text-base tw-leading-none" />
            Log
        </button>{' '}
        if the problem persists.
    </p>
);

export const IssueBox = ({
    mdiIcon,
    color,
    title,
}: {
    mdiIcon: string;
    color: string;
    title: string;
}) => (
    <Box
        mdiIcon={mdiIcon}
        color={color}
        title={title}
        content={<ErrorContent />}
    />
);

export const InfoBox = ({
    mdiIcon,
    color,
    title,
    content,
}: {
    mdiIcon: string;
    color: string;
    title: string;
    content: string;
}) => (
    <Box
        mdiIcon={mdiIcon}
        color={color}
        title={title}
        content={<p>{content}</p>}
    />
);
