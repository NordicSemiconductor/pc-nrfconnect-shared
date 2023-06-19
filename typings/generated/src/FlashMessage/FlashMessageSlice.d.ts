import { AnyAction, ThunkAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
interface State {
    idCounter: number;
    messages: FlashMessage[];
}
export type FlashMessageVariant = 'success' | 'warning' | 'error' | 'info';
export interface FlashMessage {
    id: number;
    message: string;
    variant: FlashMessageVariant;
    dismissTime?: number;
}
export type FlashMessagePayload = Omit<FlashMessage, 'id'>;
type TAction = ThunkAction<void, RootState, null, AnyAction>;
export declare const newCopiedFlashMessage: () => TAction;
export declare const newSuccessFlashMessage: (message: string, dismissTime?: number) => TAction;
export declare const newWarningFlashMessage: (message: string, dismissTime?: number) => TAction;
export declare const newErrorFlashMessage: (message: string, dismissTime?: number) => TAction;
export declare const newInfoFlashMessage: (message: string, dismissTime?: number) => TAction;
export declare const getMessages: (state: RootState) => FlashMessage[];
export declare const addNewMessage: import("@reduxjs/toolkit").ActionCreatorWithPayload<FlashMessagePayload, "app-messages/addNewMessage">, removeMessage: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "app-messages/removeMessage">;
export declare const flashMessageReducer: import("redux").Reducer<State, AnyAction>;
export {};
