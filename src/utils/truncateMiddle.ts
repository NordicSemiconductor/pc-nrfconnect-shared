/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const truncateMiddle = (str: string, clipStart = 20, clipEnd = 13) => {
    const clipStartWithEllipsis = clipStart + 3;
    if (str.length <= clipStartWithEllipsis + clipEnd) {
        return str;
    }
    const rightHandStartingPoint =
        str.length - Math.min(clipEnd, str.length - clipStartWithEllipsis);
    return `${str.substring(0, clipStart)}...${str.substring(
        rightHandStartingPoint,
        str.length,
    )}`;
};

export { truncateMiddle };
