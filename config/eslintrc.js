/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const fs = require('fs');

const entriesInGitignore = fs
    .readFileSync('.gitignore', 'utf8')
    .split('\n')
    .filter(Boolean);

module.exports = {
    reportUnusedDisableDirectives: true,
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'airbnb',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'prettier/react',
        'prettier/@typescript-eslint',
    ],
    ignorePatterns: ['package-lock.json', ...entriesInGitignore],
    rules: {
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error'],
        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        'react/jsx-key': ['error', { checkFragmentShorthand: true }],
        'react/jsx-one-expression-per-line': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/require-default-props': 'off',
        'import/prefer-default-export': 'off',
        'react/jsx-filename-extension': [1, { extensions: ['.jsx', '.tsx'] }],
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error',
        'jsx-a11y/control-has-associated-label': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/ban-ts-comment': [
            'error',
            {
                'ts-expect-error': 'allow-with-description',
            },
        ],
        camelcase: 'off',
        'linebreak-style': 'off',
        'arrow-parens': ['error', 'as-needed'],
        strict: 'off',
        'no-console': 'off',
        'no-use-before-define': 'off',
        'no-param-reassign': 'off',
        'no-unused-expressions': 'off',
        'lines-between-class-members': 'off',
        'import/no-dynamic-require': 'off',
        'valid-jsdoc': [
            2,
            {
                prefer: {
                    return: 'returns',
                },
            },
        ],
        'import/no-extraneous-dependencies': 0,
        'import/no-unresolved': [
            'error',
            {
                ignore: [
                    'pc-ble-driver-js',
                    'serialport',
                    'electron',
                    'pc-nrfconnect-shared',
                    '@electron/remote',
                ],
            },
        ],
        'import/extensions': ['off'],
        'no-undef': 1,
        'no-unused-vars': 'off',
        'require-await': 'error',
        'prettier/prettier': 'error',
        'md/remark': [
            'error',
            {
                plugins: [
                    'preset-lint-markdown-style-guide',
                    'frontmatter',
                    ['lint-no-duplicate-headings', false],
                    ['lint-list-item-indent', false],
                    ['lint-emphasis-marker', false],
                    ['lint-list-item-spacing', false],
                    ['lint-no-literal-urls', false],
                ],
            },
        ],
        'import/order': 'off',
        'simple-import-sort/imports': [
            'error',
            {
                /* This configures the order of the imports.
                   The obscure format using regexps is described at
                   https://github.com/lydell/eslint-plugin-simple-import-sort#custom-grouping
                   and there are examples at
                   https://github.com/lydell/eslint-plugin-simple-import-sort/blob/main/examples/.eslintrc.js
                */
                groups: [
                    // First all side effect imports. That strange token is
                    // described in the eslint-plugin-simple-import-sort docs
                    ['^\\u0000'],

                    // All package imports (starting with a letter, optionally
                    // prepended by an '@'), with React packages coming first.
                    ['^react', '^@?\\w'],

                    // All relative imports (starting with a '.')
                    ['^\\.'],

                    // All styles imports (ending with '.css' or '.scss')
                    ['^.+\\.s?css$'],
                ],
            },
        ],
    },
    overrides: [
        {
            files: ['*.d.ts'],
            rules: {
                'max-classes-per-file': 'off',
                'react/prefer-stateless-function': 'off',
                '@typescript-eslint/no-explicit-any': 'off',
            },
        },
        {
            files: ['*.ts', '*.tsx'],
            rules: {
                'default-case': 'off',
                'consistent-return': 'off',
                'react/prop-types': 'off',
            },
        },
        {
            files: ['*.md'],
            parser: 'markdown-eslint-parser',
            rules: {
                'prettier/prettier': ['error', { parser: 'markdown' }],
            },
        },
        {
            files: ['*.test.*'],
            rules: {
                '@typescript-eslint/no-non-null-assertion': 'off',
            },
        },
        {
            files: ['*.json'],
            rules: {
                'no-template-curly-in-string': 'off',
            },
        },
    ],
    plugins: [
        'react',
        'import',
        'react-hooks',
        'prettier',
        'simple-import-sort',
        'md',
    ],
    env: {
        es6: true,
        browser: true,
        node: true,
        jasmine: true,
        jest: true,
    },
    globals: {
        NodeJS: true,
        React: true,
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.jsx', '.tsx', '.js', '.ts'],
            },
        },
    },
};
