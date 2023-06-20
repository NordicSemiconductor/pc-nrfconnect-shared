export type Values = readonly number[];
export type Range = {
    min: number;
    max: number;
    decimals?: number;
    step?: number;
};
export type RangeOrValues = Range | Values;
export declare const isValues: (rangeOrValues: RangeOrValues) => rangeOrValues is Values;
export declare const getMin: (rangeOrValues: RangeOrValues) => number;
export declare const getMax: (rangeOrValues: RangeOrValues) => number;
export declare const getStep: (range: Range) => number;
export declare const useValidatedRangeOrValues: (rangeOrValues: RangeOrValues) => void;
