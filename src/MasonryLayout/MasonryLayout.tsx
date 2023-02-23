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
}

const MasonryLayout: React.FC<MasonryLayoutProperties> = ({
    children,
    minWidth,
}) => {
    const masonryLayoutRef = useRef<HTMLDivElement>(null);

    const [width, setWidth] = useState(-1);
    const [maxHeight, setMaxHeight] = useState(-1);
    const [columns, setColumns] = useState(-1);
    const [orders, setOrders] = useState<number[]>([]);
    const [columnHeights, setColumnHeights] = useState<number[]>([]);

    const generateHeightMatrix = useCallback((col: number) => {
        let child = masonryLayoutRef.current?.firstElementChild;
        const heightMatrix: number[][] = [];
        let i = 0;
        while (child) {
            if (child instanceof HTMLElement) {
                if (!child.className.includes('filler')) {
                    const rowIndex = Math.floor(i / col);

                    if (heightMatrix[rowIndex] === undefined) {
                        heightMatrix[rowIndex] = [];
                    }
                    const row = heightMatrix[rowIndex];

                    const columnIndex = i % col;
                    row[columnIndex] = child.offsetHeight;

                    i += 1;
                } else {
                    console.log('filler');
                }

                child = child.nextElementSibling;
            }
        }

        return heightMatrix;
    }, []);

    const calcMaxHeight = useCallback(
        (col: number): number => {
            if (!masonryLayoutRef.current) return 0;

            const heightMatrix = generateHeightMatrix(col);
            const heights: number[] = Array(col).fill(0);
            const newOrder: number[] = [];

            heightMatrix.forEach(row => {
                row.forEach(itemHeight => {
                    const smallest =
                        heights.findIndex(h => h === Math.min(...heights)) ?? 0;
                    heights[smallest] += itemHeight;
                    newOrder.push(smallest + 1);
                });
            });

            setOrders(newOrder);
            setColumnHeights(heights);
            return Math.max(...heights);
        },
        [generateHeightMatrix]
    );

    useEffect(() => {
        if (masonryLayoutRef.current === null) return;

        const current = masonryLayoutRef.current;

        const observer = new ResizeObserver(() => {
            if (current.clientWidth !== width) {
                setWidth(current.clientWidth);
                const noOfColumns = Math.floor(
                    current.clientWidth /
                        (minWidth + Number.parseInt(styles.margin, 10))
                );
                if (noOfColumns !== columns) {
                    setColumns(noOfColumns);
                    setMaxHeight(calcMaxHeight(noOfColumns));
                }
            } else {
                setMaxHeight(calcMaxHeight(columns));
            }
        });
        observer.observe(masonryLayoutRef.current);

        return () => {
            current && observer.unobserve(current);
        };
    }, [calcMaxHeight, columns, minWidth, width]);

    useEffect(() => {
        console.log(
            'columnHeights',
            columnHeights,
            columnHeights.map((h, i) =>
                h !== maxHeight
                    ? {
                          height: `${maxHeight - h}px`,
                          order: `${i + 1}`,
                      }
                    : null
            )
        );
    }, [columnHeights, maxHeight]);

    return (
        <div
            ref={masonryLayoutRef}
            className={classNames(styles.masonryLayout)}
            style={{ maxHeight: `${maxHeight}px` }}
        >
            {React.Children.map(children, (child, i) => (
                <div
                    style={{
                        minWidth,
                        order: `${orders[i] ?? 1}`,
                        pageBreakBefore: `${i < columns ? 'always' : 'auto'}`,
                    }}
                >
                    {child}
                </div>
            ))}
            {columnHeights.map((h, i) =>
                h !== maxHeight ? (
                    <div
                        className="filler"
                        key={`filler_${h + i}`}
                        style={{
                            height: `${maxHeight - h}px`,
                            order: `${i + 1}`,
                        }}
                    />
                ) : null
            )}
        </div>
    );
};

export default MasonryLayout;
