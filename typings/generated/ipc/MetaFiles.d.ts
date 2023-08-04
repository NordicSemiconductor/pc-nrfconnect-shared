export type UrlString = string;
export interface SourceJson {
    name: string;
    apps: UrlString[];
}
export type WithdrawnJson = UrlString[];
export type AppVersions = {
    [version: string]: {
        shasum?: string;
        tarballUrl: UrlString;
        nrfutilModules?: nrfutilModules;
    };
};
export interface AppInfo {
    name: string;
    displayName: string;
    description: string;
    homepage?: UrlString;
    iconUrl: UrlString;
    releaseNotesUrl: UrlString;
    latestVersion: string;
    versions: AppVersions;
    installed?: {
        path: string;
        shasum?: string;
    };
}
interface ObjectContainingOptionalStrings {
    [index: string]: string | undefined;
}
interface nrfConnectForDesktop {
    nrfutil?: nrfutilModules;
}
interface nrfutilModules {
    [index: string]: string[] | undefined;
}
export interface PackageJson {
    name: string;
    version: string;
    author?: string;
    bin?: ObjectContainingOptionalStrings | string;
    dependencies?: ObjectContainingOptionalStrings;
    description?: string;
    homepage?: UrlString;
    devDependencies?: ObjectContainingOptionalStrings;
    displayName?: string;
    engines?: ObjectContainingOptionalStrings;
    nrfConnectForDesktop?: nrfConnectForDesktop;
    files?: readonly string[];
    license?: string;
    main?: string;
    peerDependencies?: ObjectContainingOptionalStrings;
    repository?: {
        type: string;
        url: UrlString;
    };
    scripts?: ObjectContainingOptionalStrings;
}
export {};
//# sourceMappingURL=MetaFiles.d.ts.map