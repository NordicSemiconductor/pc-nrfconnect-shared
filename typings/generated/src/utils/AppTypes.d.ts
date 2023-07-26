export interface SourceJson {
    name: string;
    apps: string[];
}
export type AppVersions = {
    [version: string]: {
        shasum?: string;
        tarballUrl: string;
    };
};
export interface AppInfo {
    name: string;
    displayName: string;
    description: string;
    homepage?: string;
    iconUrl: string;
    releaseNotesUrl: string;
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
export interface PackageJson {
    name: string;
    version: string;
    author?: string;
    bin?: ObjectContainingOptionalStrings | string;
    dependencies?: ObjectContainingOptionalStrings;
    description?: string;
    homepage?: string;
    devDependencies?: ObjectContainingOptionalStrings;
    displayName?: string;
    engines?: ObjectContainingOptionalStrings;
    files?: readonly string[];
    license?: string;
    main?: string;
    peerDependencies?: ObjectContainingOptionalStrings;
    repository?: {
        type: string;
        url: string;
    };
    scripts?: ObjectContainingOptionalStrings;
}
export {};
//# sourceMappingURL=AppTypes.d.ts.map