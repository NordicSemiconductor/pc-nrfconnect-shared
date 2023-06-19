import React from 'react';
interface DocumentationSectionProps {
    title?: string;
    linkLabel?: string;
    link?: string;
}
export interface DocumentationState {
    sections: React.Component<DocumentationSectionProps>[];
}
export declare const reducer: import("redux").Reducer<DocumentationState, import("redux").AnyAction>, setDocumentationSections: import("@reduxjs/toolkit").ActionCreatorWithPayload<any, "documentation/setDocumentationSections">;
export declare const documentationSections: ({ documentation }: any) => any;
export {};
