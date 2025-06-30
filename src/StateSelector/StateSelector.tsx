/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import classNames from '../utils/classNames';

interface ComplexItem {
    key: string;
    renderItem: React.ReactNode;
    title?: string;
}

type SelectItem = string | ComplexItem;

const convertToComplex = (item: SelectItem): ComplexItem => {
    if (typeof item === 'string') {
        return {
            key: item,
            renderItem: item,
            title: undefined,
        } as ComplexItem;
    }

    return item as ComplexItem;
};

const SwitchButton: React.FC<{
    variant: string;
    onClick: () => void;
    disabled: boolean;
    children: React.ReactNode;
    size?: 'sm' | 'md';
    title?: string;
}> = ({ variant, onClick, disabled, children, size = 'md', title }) => (
    <button
        type="button"
        className={`${classNames(
            'tw-relative tw-flex-1 tw-flex-shrink-0 tw-rounded-sm tw-text-sm',
            size === 'sm' && 'tw-p-0 tw-text-xs',
            size === 'md' && 'tw-p-1',
            variant === 'set' &&
                'tw-border-gray-700 tw-bg-white tw-text-gray-700',
            variant === 'unset' &&
                'tw-border-white tw-bg-gray-700 tw-text-white'
        )}`}
        onClick={onClick}
        disabled={disabled}
        title={title}
    >
        {children}
    </button>
);

export interface Props {
    items: SelectItem[];
    onSelect: (index: number) => void;
    disabled?: boolean;
    selectedItem: SelectItem;
    size?: 'sm' | 'md';
}

export default ({
    items,
    onSelect,
    disabled = false,
    selectedItem,
    size = 'md',
}: Props) => {
    const selectionButton = (item: SelectItem, index: number) => {
        const complexItem = convertToComplex(item);
        const complexSelectedItem = convertToComplex(selectedItem);
        return (
            <SwitchButton
                key={complexItem.key}
                variant={
                    complexSelectedItem.key === complexItem.key
                        ? 'set'
                        : 'unset'
                }
                onClick={() => {
                    onSelect(index);
                }}
                disabled={disabled}
                size={size}
                title={complexItem.title}
            >
                {complexItem.renderItem}
            </SwitchButton>
        );
    };

    return (
        <div className="tw-preflight tw-flex tw-w-full tw-flex-row tw-justify-center tw-bg-gray-700 tw-p-1">
            {items.map((item, index) => selectionButton(item, index))}
        </div>
    );
};
