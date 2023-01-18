import React from 'react';
interface DocumentationSectionProps {
    title?: string;
    linkLabel?: string;
    link?: string;
}
export interface DocumentationState {
    sections: React.Component<DocumentationSectionProps>[];
}
export declare const reducer: import("redux").Reducer<DocumentationState, import("redux").AnyAction>, setDocumentationSections: import("@reduxjs/toolkit").ActionCreatorWithPayload<any, string>;
export declare const documentationSections: ({ documentation }: any) => any;
export {};
//# sourceMappingURL=documentationSlice.d.ts.map