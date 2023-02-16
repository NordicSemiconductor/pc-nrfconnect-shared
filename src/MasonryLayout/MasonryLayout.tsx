/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';

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
    const [height, setHeight] = useState(-1);
    const [columns, setColumns] = useState(-1);
    const [orders, setOrders] = useState<number[]>([]);

    const generateHeightMatrix = (col: number) => {
        let child = masonryLayoutRef.current?.firstElementChild;
        const heightMatrix: number[][] = [];
        let i = 0;
        while (child) {
            if (child instanceof HTMLElement) {
                const rowIndex = Math.floor(i / col);

                if (heightMatrix[rowIndex] === undefined) {
                    heightMatrix[rowIndex] = [];
                }
                const row = heightMatrix[rowIndex];

                const columnIndex = i % col;
                row[columnIndex] = child.offsetHeight;

                child = child.nextElementSibling;
                i += 1;
            }
        }

        return heightMatrix;
    };

    const calcMaxHeight = useCallback((col: number): number => {
        if (!masonryLayoutRef.current) return 0;

        const heightMatrix = generateHeightMatrix(col);

        const heights: number[] = Array(col).fill(0);
        const newOrder: number[] = [];

        heightMatrix.forEach(row => {
            row.forEach(h => {
                const smallest =
                    heights.findIndex(v => v === Math.min(...heights)) ?? 0;
                heights[smallest] += h;
                newOrder.push(smallest + 1);
            });
        });

        setOrders(newOrder);

        return Math.max(...heights) + 1;
    }, []);

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
                }

                setHeight(calcMaxHeight(noOfColumns));
            } else {
                setHeight(calcMaxHeight(columns));
            }
        });
        observer.observe(masonryLayoutRef.current);

        return () => {
            current && observer.unobserve(current);
        };
    }, [calcMaxHeight, columns, minWidth, width]);

    return (
        <div
            ref={masonryLayoutRef}
            className={styles.masonryLayout}
            style={{ maxHeight: height }}
        >
            {React.Children.map(children, (child, i) => (
                <div
                    style={{
                        minWidth,
                        order: `${orders[i]}`,
                        pageBreakBefore: `${i < columns ? 'always' : 'auto'}`,
                    }}
                >
                    {child}
                </div>
            ))}
        </div>
    );
};

export default MasonryLayout;
