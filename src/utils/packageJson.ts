/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* Explanation for that cascade of eslint-disable-next-line and @ts-ignore:
   '../../../../package.json' will resolve correctly when `shared` is used in
   a real app, so it is fine.

   When checking `shared` '../../../../package.json' will not be there, so we
   need to disable the errors that occur in that case. That is done by the
   second and third statement:
     // @ts-ignore This will be available when the app uses it.
     // eslint-disable-next-line import/no-unresolved

   Usually we would not use `@ts-ignore` but rather `@ts-expect-error`. But
   the latter is not possible for a different reason: When we type-check an
   app that uses shared, that line will now be type-checked too and now
   '../../../../package.json' actually is there, so `ts-expect-error` would
   lead to an error, telling us that contrary to our expectation there is no
   error there.

   Because of that we have to use `@ts-ignore`. But that is usually forbidden
   by the linting rules, so additionally we have to add that first line
     eslint-disable-next-line @typescript-eslint/ban-ts-comment

   Phew!
*/
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore This will be available when the app uses it.
// eslint-disable-next-line import/no-unresolved
import packageJson from '../../../../../package.json';
import type { PackageJson } from '../../ipc/MetaFiles';

export default () => {
    if (packageJson == null) {
        throw new Error(`package.json was not read. This can be caused by one of two things:
- Either a programming error in the app that tries to use the content of package.json very early before it was loaded.
- Or if the app was packaged without a package.json, but in that case the launcher should not even launch this app.`);
    }

    return packageJson as PackageJson;
};
