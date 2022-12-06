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
        'plugin:import/recommended',
        'plugin:import/typescript',
        'prettier',
    ],
    ignorePatterns: [
        'package-lock.json',
        'scripts/nordic-publish.js',
        ...entriesInGitignore,
    ],
    rules: {
        'prefer-destructuring': 'off',
        '@typescript-eslint/ban-ts-comment': [
            'error',
            { 'ts-expect-error': 'allow-with-description' },
        ],
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-var-requires': 'off',
        'import/default': 'error',
        'import/extensions': 'off',
        'import/named': 'error',
        'import/no-extraneous-dependencies': 'off',
        'import/no-unresolved': [
            'error',
            {
                ignore: [
                    'serialport',
                    'electron',
                    'pc-nrfconnect-shared',
                    '@electron/remote',
                ],
            },
        ],
        'import/prefer-default-export': 'off',
        'jsx-a11y/control-has-associated-label': 'off',
        'linebreak-style': 'off',
        'lines-between-class-members': 'off',
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
        'no-console': 'off',
        'no-param-reassign': 'off',
        'no-shadow': 'off',
        'no-undef': 'error',
        'no-unused-expressions': 'off',
        'no-unused-vars': 'off',
        'no-use-before-define': 'off',
        'prettier/prettier': 'error',
        'react-hooks/exhaustive-deps': 'error',
        'react-hooks/rules-of-hooks': 'error',
        'react/function-component-definition': [
            'error',
            {
                namedComponents: 'arrow-function',
                unnamedComponents: 'arrow-function',
            },
        ],
        'react/jsx-filename-extension': [
            'error',
            { extensions: ['.jsx', '.tsx'] },
        ],
        'react/jsx-key': ['error', { checkFragmentShorthand: true }],
        'react/jsx-no-useless-fragment': ['error', { allowExpression: true }],
        'react/jsx-one-expression-per-line': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/require-default-props': 'off',
        'require-await': 'error',
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
        'valid-jsdoc': ['error', { prefer: { return: 'returns' } }],
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
        {
            files: [
                '**/__tests__/**/*.[jt]s?(x)',
                '**/?(*.)+(spec|test).[jt]s?(x)',
            ],
            extends: ['plugin:testing-library/react'],
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
};
