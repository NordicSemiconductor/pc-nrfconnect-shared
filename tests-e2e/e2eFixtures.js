/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable no-underscore-dangle */

const baseTest = require('@playwright/test').test;
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// todo: change pass / move to conf
const istanbulCLIOutput = path.join(process.cwd(), 'test-e2e/.nyc_output');

function generateUUID() {
    return crypto.randomBytes(16).toString('hex');
}

const test = baseTest.extend({
    context: async ({ context }, use) => {
        await context.addInitScript(() =>
            window.addEventListener('beforeunload', () => {
                window.collectIstanbulCoverage(
                    JSON.stringify(window.__coverage__)
                );
            })
        );

        await fs.promises.mkdir(istanbulCLIOutput, { recursive: true });

        await context.exposeFunction(
            'collectIstanbulCoverage',
            coverageJSON => {
                if (!coverageJSON) return;

                fs.writeFileSync(
                    path.join(
                        istanbulCLIOutput,
                        `playwright_coverage_${generateUUID()}.json`
                    ),
                    coverageJSON
                );
            }
        );

        await use(context);

        // eslint-disable-next-line no-restricted-syntax
        for (const page of context.pages()) {
            // eslint-disable-next-line no-await-in-loop
            await page.evaluate(() =>
                window.collectIstanbulCoverage(
                    JSON.stringify(window.__coverage__)
                )
            );
        }
    },
});

module.exports = {
    expect: test.expect,
    test,
};
