import { FC, ReactNode } from 'react';
import { Reducer } from 'redux';
declare const ConnectedToStore: FC<{
    appReducer?: Reducer;
    children: ReactNode;
}>;
export default ConnectedToStore;
