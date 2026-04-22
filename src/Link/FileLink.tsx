/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import classNames from '../utils/classNames';
import { openFile } from '../utils/open';

interface FileLinkProps
    extends Pick<React.ComponentProps<'button'>, 'ref' | 'className'> {
    fileLocation: string;
}

const FileLink: React.FC<React.PropsWithChildren<FileLinkProps>> = ({
    fileLocation,
    children,
    className,
    ...attrs
}) => (
    <button
        type="button"
        onClick={() => openFile(fileLocation)}
        className={classNames(
            'tw-preflight tw-overflow-hidden tw-text-ellipsis tw-text-nordicBlue hover:tw-underline',
            className,
        )}
        {...attrs}
    >
        {children}
    </button>
);

export default FileLink;
