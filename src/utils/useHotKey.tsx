/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useEffect } from 'react';
import Mousetrap from 'mousetrap';

export default (key: string | string[], onKeypress: () => void) => {
    useEffect(() => {
        Mousetrap.bind(key, onKeypress);

        return () => {
            Mousetrap.unbind(key);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps -- Only run this on
    // mount/unmount, currently we do not want to support changing keybindings inbetween
};
