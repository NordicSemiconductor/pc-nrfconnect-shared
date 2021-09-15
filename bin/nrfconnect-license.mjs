#!/usr/bin/env node

/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

import glob from 'fast-glob';
import { existsSync, readFileSync, writeFileSync } from 'fs';

const SHEBANG_LINE = /^#!.*?(\r?\n)+/;
const SPECIAL_REGEXP_CHARACTERS = /([.*+\\(){}[\]])/g;
const LINE_ENDINGS = /\r?\n/g;

const correctLicense = `Copyright (c) __YEAR__ Nordic Semiconductor ASA
All rights reserved.

SPDX-License-Identifier: Nordic-4-Clause

Use in source and binary forms, redistribution in binary form only, with
or without modification, are permitted provided that the following conditions
are met:

1. Redistributions in binary form, except as embedded into a Nordic
   Semiconductor ASA integrated circuit in a product or a software update for
   such product, must reproduce the above copyright notice, this list of
   conditions and the following disclaimer in the documentation and/or other
   materials provided with the distribution.

2. Neither the name of Nordic Semiconductor ASA nor the names of its
   contributors may be used to endorse or promote products derived from this
   software without specific prior written permission.

3. This software, with or without modification, must only be used with a Nordic
   Semiconductor ASA integrated circuit.

4. Any software provided in binary form under this license must not be reverse
   engineered, decompiled, modified and/or disassembled.

THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`;

const correctHeader = `/*
 * Copyright (c) __YEAR__ Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */`;

const outdatedLicense = `/* Copyright (c) __YEARS__, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */`;

const fail = message => {
    console.error(message);
    process.exit(1);
};

const asRegexp = string =>
    RegExp(
        `^${string
            .replace(SPECIAL_REGEXP_CHARACTERS, '\\$1')
            .replace(LINE_ENDINGS, '\\r?\\n') // Because reference string and input string could have different EOLs
            .replace('__YEAR__', '\\d{4}')
            .replace('__YEARS__', '(?<oldStartingYear>\\d{4})( - \\d{4})?')}`
    );

const checkLicense = () => {
    if (!existsSync('./LICENSE')) {
        fail(`Missing file 'LICENSE' in the root of the project.`);
    }

    const actualLicense = readFileSync('./LICENSE', {
        encoding: 'utf8',
    }).trim();
    if (!actualLicense.match(asRegexp(correctLicense))) {
        fail(`The file 'LICENSE' does not contain the correct license.`);
    }
};

const allSourceFiles = () =>
    glob.sync(
        [
            '*.js',
            '*.jsx',
            '*.mjs',
            '*.ts',
            '*.tsx',
            '*.css',
            '*.scss',
            '*.sass',
        ],
        {
            ignore: ['node_modules', 'dist', '.git'],
            baseNameMatch: true,
        }
    );

const missesCorrectHeader = file =>
    !readFileSync(file, { encoding: 'utf8' })
        .replace(SHEBANG_LINE, '')
        .trim()
        .match(asRegexp(correctHeader));

const checkHeaders = () => {
    const filesWithoutCorrectHeader =
        allSourceFiles().filter(missesCorrectHeader);

    if (filesWithoutCorrectHeader.length > 0) {
        const runningInShared = existsSync('./bin/nrfconnect-license.mjs');
        const nrfconnectLicenseScript = runningInShared
            ? './bin/nrfconnect-license.mjs update'
            : 'nrfconnect-license update';

        const listOfFiles = filesWithoutCorrectHeader
            .map(file => `- ${file}\n`)
            .join('');

        fail(
            `These files do not contain the correct license, try fixing this` +
                ` with running '${nrfconnectLicenseScript}':\n${listOfFiles}`
        );
    }
};

const check = () => {
    checkLicense();
    checkHeaders();
};

const firstLineEnding = content => {
    if (content.match(LINE_ENDINGS)) {
        return content.match(LINE_ENDINGS)[0];
    }
    return '\n';
};

const splitOffShebangLine = content => {
    if (content.match(SHEBANG_LINE)) {
        const shebangLine = content.match(SHEBANG_LINE)[0];
        return {
            shebangLine,
            contentWithoutShebang: content.replace(SHEBANG_LINE, ''),
        };
    }

    return {
        shebangLine: '',
        contentWithoutShebang: content,
    };
};

const removeOutdatedLicense = content => {
    const hadOutdatedLicense = content.match(asRegexp(outdatedLicense)) != null;
    const oldStartYear = content.match(asRegexp(outdatedLicense))?.groups
        ?.oldStartingYear;
    const remainingContent = content
        .replace(asRegexp(outdatedLicense), '')
        .trimStart();

    return {
        hadOutdatedLicense,
        oldStartYear,
        remainingContent,
    };
};

const updateHeader = file => {
    if (!missesCorrectHeader(file)) {
        return;
    }

    const originalContent = readFileSync(file, { encoding: 'utf8' });

    const lineEnding = firstLineEnding(originalContent);

    const { shebangLine, contentWithoutShebang } =
        splitOffShebangLine(originalContent);
    const { hadOutdatedLicense, oldStartYear, remainingContent } =
        removeOutdatedLicense(contentWithoutShebang);

    const COMMENT_START = '/*';
    if (!hadOutdatedLicense && remainingContent.startsWith(COMMENT_START)) {
        console.warn(
            `The file '${file}' has a comment at the beginning which is not a known outdated license. Not touching this file.`
        );
        return;
    }

    const currentYear = new Date().getFullYear();
    const newHeader = correctHeader
        .replace(/\r?\n/g, lineEnding)
        .replace('__YEAR__', oldStartYear ?? currentYear);

    writeFileSync(
        file,
        shebangLine + newHeader + lineEnding + lineEnding + remainingContent
    );
    console.log(
        `${
            hadOutdatedLicense ? 'Updated' : 'Added'
        } license header in file '${file}'`
    );
};

const update = () => {
    allSourceFiles().forEach(updateHeader);
};

const script = process.argv[2];

switch (script) {
    case 'check':
        check();
        break;
    case 'update':
        update();
        break;
    default:
        fail(`Must provide either 'check' or 'update' as a parameter.`);
}
