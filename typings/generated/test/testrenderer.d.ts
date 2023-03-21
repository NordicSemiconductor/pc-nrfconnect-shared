import React from 'react';
import { Action, Reducer } from 'redux';
export declare const testRendererForApps: (appReducer?: Reducer) => (element: React.ReactElement, actions?: Action[]) => import("@testing-library/react").RenderResult<typeof import("@testing-library/dom/types/queries")>;
declare const _default: (element: React.ReactElement, actions?: Action[], appReducer?: Reducer) => import("@testing-library/react").RenderResult<typeof import("@testing-library/dom/types/queries")>;
export default _default;
