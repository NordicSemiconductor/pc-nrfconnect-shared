import { UrlString } from './MetaFiles';
declare enum StandardSourceNames {
    OFFICIAL = "official",
    LOCAL = "local"
}
export declare const LOCAL: StandardSourceNames, OFFICIAL: StandardSourceNames;
export declare const allStandardSourceNames: SourceName[];
export type SourceName = string;
export type SourceUrl = UrlString;
export type Source = {
    name: SourceName;
    url: SourceUrl;
};
export {};
//# sourceMappingURL=sources.d.ts.map