import { PropsWithChildren } from 'react';
interface MasonryLayoutProperties {
    minWidth: number;
    className?: string;
}
/**
 * Builds a masonry layout around all depth 1 child components.
 * Note: only depth 1 children are considered for the layout.
 * This also applies for React.Fragment wrapped components.
 * @param {number} minWidth minimum width of every item in this layout.
 * @returns {React.FC<MasonryLayoutProperties>} React Component.
 */
declare const _default: ({ children, minWidth, className, }: PropsWithChildren<MasonryLayoutProperties>) => JSX.Element;
export default _default;
//# sourceMappingURL=MasonryLayout.d.ts.map