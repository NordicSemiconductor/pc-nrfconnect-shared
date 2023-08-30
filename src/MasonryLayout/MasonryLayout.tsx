/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';

import classNames from '../utils/classNames';

import styles from './masonryLayout.module.scss';

interface MasonryLayoutProperties {
    minWidth: number;
    className?: string;
}

interface WrappedChildrenProperties {
    hiddenChildren: boolean[];
    width: number;
    columns: number;
    minWidth: number;
    orders: number[];
}

const WrappedChildren = ({
    children,
    hiddenChildren,
    width,
    columns,
    minWidth,
    orders,
}: PropsWithChildren<WrappedChildrenProperties>) => (
    <>
        {React.Children.map(children, (child, i) => (
            <div
                data-hidden={hiddenChildren[i] === true ? 'true' : 'false'}
                style={{
                    width: `${width / columns}px`,
                    minWidth,
                    order: `${orders[i] ?? 1}`,
                    pageBreakBefore: `${i < columns ? 'always' : 'auto'}`,
                }}
            >
                {child}
            </div>
        ))}
    </>
);

interface FillersProperties {
    maxHeight: number;
    columns: number;
    width: number;
    columnHeights: number[];
}

const Fillers = ({
    maxHeight,
    columns,
    width,
    columnHeights,
}: FillersProperties) => (
    <>
        {columnHeights.map((h, i) =>
            h !== maxHeight ? (
                <div
                    data-filler="true"
                    key={`filler_${i + 0}`}
                    style={{
                        height: `${maxHeight - h}px`,
                        order: `${i + 1}`,
                        width: `${width / columns}px`,
                    }}
                />
            ) : null
        )}
    </>
);

/**
 * Builds a masonry layout around all depth 1 child components.
 * Note: only depth 1 children are considered for the layout.
 * This also applies for React.Fragment wrapped components.
 * @param {number} minWidth minimum width of every item in this layout.
 * @returns {React.FC<MasonryLayoutProperties>} React Component.
 */
export default ({
    children,
    minWidth,
    className,
}: PropsWithChildren<MasonryLayoutProperties>) => {
    const [maxHeight, setMaxHeight] = useState(0);
    const [columns, setColumns] = useState(-1);
    const [orders, setOrders] = useState<number[]>([]);
    const [hiddenChildren, setHiddenChildren] = useState<boolean[]>([]);
    const [columnHeights, setColumnHeights] = useState<number[]>([]);

    const masonryLayoutRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (masonryLayoutRef.current === null) return;

        const generateMetaData = (col: number) => {
            let child = masonryLayoutRef.current?.firstElementChild;
            const heightMatrix: number[][] = [];
            const zeroHeightChildren: boolean[] = [];

            let i = 0;
            while (child) {
                if (child instanceof HTMLElement) {
                    if (!child.hasAttribute('data-filler')) {
                        const rowIndex = Math.floor(i / col);

                        if (heightMatrix[rowIndex] === undefined) {
                            heightMatrix[rowIndex] = [];
                        }

                        const row = heightMatrix[rowIndex];
                        const columnIndex = i % col;

                        i += 1;
                        if (
                            child.offsetHeight <=
                            Number.parseInt(styles.margin, 10)
                        ) {
                            row[columnIndex] = 0;
                            zeroHeightChildren.push(true);
                        } else {
                            row[columnIndex] = child.offsetHeight + 1;
                            zeroHeightChildren.push(false);
                        }
                    }

                    child = child.nextElementSibling;
                }
            }

            return { heightMatrix, hiddenChildren: zeroHeightChildren };
        };

        const calcData = (col: number) => {
            const metaData = generateMetaData(col);
            const heights: number[] = Array(col).fill(0);
            const newOrder: number[] = [];

            metaData.heightMatrix.forEach(row => {
                row.forEach(itemHeight => {
                    const smallest =
                        heights.findIndex(h => h === Math.min(...heights)) ?? 0;
                    heights[smallest] += itemHeight;
                    newOrder.push(smallest + 1);
                });
            });

            return {
                maxHeight: Math.max(...heights, 0),
                order: newOrder,
                columnHeights: heights,
                columns: Math.min(
                    metaData.hiddenChildren.filter(v => !v).length,
                    col
                ),
                maxColums: col,
                hiddenChildren: metaData.hiddenChildren,
            };
        };

        const action = () => {
            const noOfColumns = Math.floor(
                current.clientWidth /
                    (minWidth + Number.parseInt(styles.margin, 10))
            );

            const data = calcData(noOfColumns);
            if (data) {
                setOrders(data.order);
                setColumnHeights(data.columnHeights);
                setMaxHeight(data.maxHeight);
                setHiddenChildren(data.hiddenChildren);
                setColumns(data.columns);
            }
        };

        const current = masonryLayoutRef.current;

        const observer = new ResizeObserver(action);
        observer.observe(masonryLayoutRef.current);
        const mutationObserver = new MutationObserver(action);
        mutationObserver.observe(masonryLayoutRef.current, {
            childList: true,
            subtree: true,
            attributes: true,
        });

        return () => {
            current && observer.unobserve(current);
            current && mutationObserver.disconnect();
        };
    }, [columns, maxHeight, minWidth]);

    return (
        <div className={styles.masonryLayoutOut}>
            <div
                ref={masonryLayoutRef}
                className={classNames(styles.masonryLayout, className)}
                style={{ maxHeight: `${maxHeight}px` }}
            >
                <WrappedChildren
                    hiddenChildren={hiddenChildren}
                    width={masonryLayoutRef.current?.clientWidth ?? -1}
                    columns={columns}
                    minWidth={minWidth}
                    orders={orders}
                >
                    {children}
                </WrappedChildren>
                <Fillers
                    maxHeight={maxHeight}
                    columns={columns}
                    width={masonryLayoutRef.current?.clientWidth ?? -1}
                    columnHeights={columnHeights}
                />
            </div>
        </div>
    );
};
