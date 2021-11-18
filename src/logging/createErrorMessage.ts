/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

interface MaybeWithMessageAndOrigin {
    message?: string;
    origin?: MaybeWithMessageAndOrigin;
}

function hasMaybeMessageAndOrigin(
    error: unknown
): error is MaybeWithMessageAndOrigin {
    return error != null;
}

const describe = (error: MaybeWithMessageAndOrigin) => {
    if (error instanceof Error) {
        return String(error);
    }

    if (error.message != null) {
        return error.message;
    }

    return JSON.stringify(error);
};

const describeOrigin = (origin?: MaybeWithMessageAndOrigin) => {
    if (origin == null) {
        return '';
    }

    return ` (Origin: ${describe(origin)})`;
};

export default (message: string, error: unknown) => {
    if (error == null) {
        return message;
    }

    /* Because we asserted that error is neither null nor undefined above, we
       can access properties like `message` and `origin` from here on, without
       fearing a "Cannot read property 'message' of null/undefined". But
       TypeScript is not convinced of this. So here comes a statement with a
       Error that should really never be thrown, just to convince TypeScript
       of the fact that we can afterwards read the properties `message` and
       `origin`.
    */
    if (!hasMaybeMessageAndOrigin(error)) {
        throw Error('Will never be thrown');
    }

    return `${message}: ${describe(error)}${describeOrigin(error.origin)}`;
};
