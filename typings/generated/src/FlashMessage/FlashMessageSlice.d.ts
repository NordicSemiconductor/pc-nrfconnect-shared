import type { RootState, TAction } from '../store';
export interface FlashMessages {
    messages: FlashMessage[];
}
export type FlashMessageVariant = 'success' | 'warning' | 'error' | 'info';
export interface FlashMessage {
    id: string;
    message: string;
    variant: FlashMessageVariant;
    dismissTime?: number;
}
export type FlashMessagePayload = Omit<FlashMessage, 'id'>;
export declare const newCopiedFlashMessage: () => TAction;
export declare const newSuccessFlashMessage: (message: string, dismissTime?: number) => TAction;
export declare const newWarningFlashMessage: (message: string, dismissTime?: number) => TAction;
export declare const newErrorFlashMessage: (message: string, dismissTime?: number) => TAction;
export declare const newInfoFlashMessage: (message: string, dismissTime?: number) => TAction;
export declare const getMessages: (state: RootState) => FlashMessage[];
export declare const reducer: import("redux").Reducer<FlashMessages, import("redux").AnyAction>, addNewMessage: import("@reduxjs/toolkit").ActionCreatorWithPayload<FlashMessagePayload, "flashMessages/addNewMessage">, removeMessage: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "flashMessages/removeMessage">;
