import React from 'react';
import { Action, AnyAction, Reducer } from 'redux';
import { ThunkAction } from 'redux-thunk';
type TAction = ThunkAction<void, any, null, AnyAction>;
export declare const testRendererForApps: (appReducer?: Reducer) => (element: React.ReactElement, actions?: (Action | TAction)[]) => import("@testing-library/react").RenderResult<typeof import("@testing-library/dom/types/queries")>;
declare const _default: (element: React.ReactElement, actions?: (Action | TAction)[], appReducer?: Reducer) => import("@testing-library/react").RenderResult<typeof import("@testing-library/dom/types/queries")>;
export default _default;
//# sourceMappingURL=testrenderer.d.ts.map