/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';

import classNames from '../utils/classNames';

import styles from './masonryLayout.module.scss';

interface MasonryLayoutProperties {
    minWidth: number;
    className?: string;
}

const MasonryLayout: React.FC<MasonryLayoutProperties> = ({
    children,
    minWidth,
    className,
}) => {
    const masonryLayoutRef = useRef<HTMLDivElement>(null);

    const [width, setWidth] = useState(-1);
    const [maxHeight, setMaxHeight] = useState(-1);
    const [columns, setColumns] = useState(-1);
    const [orders, setOrders] = useState<number[]>([]);
    const [hiddenChildren, setHiddenChildren] = useState<boolean[]>([]);
    const [columnHeights, setColumnHeights] = useState<number[]>([]);

    const generateMetaData = useCallback((col: number) => {
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
                        child.offsetHeight <= Number.parseInt(styles.margin, 10)
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

        console.log([...heightMatrix]);
        return { heightMatrix, hiddenChildren: zeroHeightChildren };
    }, []);

    const calcData = useCallback(
        (col: number) => {
            if (!masonryLayoutRef.current) return null;

            const metaData = generateMetaData(col);
            const heights: number[] = Array(col).fill(0);
            const newOrder: number[] = [];

            metaData.heightMatrix.forEach(row => {
                row.forEach(itemHeight => {
                    const smallest =
                        heights.findIndex(h => h === Math.min(...heights)) ?? 0;
                    heights[smallest] += itemHeight;
                    console.log([...heights]);
                    newOrder.push(smallest + 1);
                });
            });

            return {
                maxHeight: Math.max(...heights),
                order: newOrder,
                columnHeights: heights,
                columns: Math.min(
                    metaData.hiddenChildren.filter(v => !v).length,
                    col
                ),
                maxColums: col,
                hiddenChildren: metaData.hiddenChildren,
            };
        },
        [generateMetaData]
    );

    useEffect(() => {
        if (masonryLayoutRef.current === null) return;

        const current = masonryLayoutRef.current;

        const observer = new ResizeObserver(() => {
            const noOfColumns = Math.floor(
                current.clientWidth /
                    (minWidth + Number.parseInt(styles.margin, 10))
            );

            if (current.clientWidth !== width) {
                setWidth(current.clientWidth);
            }

            if (noOfColumns !== columns) {
                const data = calcData(noOfColumns);
                console.log('data0', data, noOfColumns, current.clientWidth);
                if (data) {
                    setOrders(data.order);
                    setColumnHeights(data.columnHeights);
                    setMaxHeight(data.maxHeight);
                    setHiddenChildren(data.hiddenChildren);
                    setColumns(data.columns);
                }
            }
        });
        observer.observe(masonryLayoutRef.current);

        return () => {
            current && observer.unobserve(current);
        };
    }, [calcData, columns, minWidth, width]);

    return (
        <div className={styles.masonryLayoutOut}>
            <div
                ref={masonryLayoutRef}
                className={classNames(styles.masonryLayout, className)}
                style={{ maxHeight: `${maxHeight}px` }}
            >
                {React.Children.map(children, (child, i) => (
                    <div
                        data-hidden={
                            hiddenChildren[i] === true
                                ? 'true'
                                : `${hiddenChildren[i]}`
                        }
                        style={{
                            width: `${width / columns}px`,
                            minWidth,
                            order: `${orders[i] ?? 1}`,
                            pageBreakBefore: `${
                                i < columns ? 'always' : 'auto'
                            }`,
                        }}
                    >
                        {child}
                    </div>
                ))}
                {columnHeights.map((h, i) =>
                    h !== maxHeight ? (
                        <div
                            data-filler="true"
                            key={`filler_${h + i}`}
                            style={{
                                height: `${maxHeight - h}px`,
                                order: `${i + 1}`,
                                width: `${width / columns}px`,
                            }}
                        />
                    ) : null
                )}
            </div>
        </div>
    );
};

export default MasonryLayout;
