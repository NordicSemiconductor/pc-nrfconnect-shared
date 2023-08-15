import React from 'react';
import { Action as SimpleAction, Reducer } from 'redux';
import { AppThunk } from '../src/store';
type Action = SimpleAction | AppThunk<never>;
export declare const testRendererForApps: (appReducer?: Reducer) => (element: React.ReactElement, actions?: Action[]) => import("@testing-library/react").RenderResult<typeof import("@testing-library/dom/types/queries")>;
declare const _default: (element: React.ReactElement, actions?: Action[], appReducer?: Reducer) => import("@testing-library/react").RenderResult<typeof import("@testing-library/dom/types/queries")>;
export default _default;
//# sourceMappingURL=testrenderer.d.ts.map