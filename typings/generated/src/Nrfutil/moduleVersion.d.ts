import { Dependency, SubDependency } from './sandboxTypes';
export declare const describeVersion: (version?: SubDependency | string) => string;
type KnownModule = 'nrfdl' | 'jprog' | 'JlinkARM';
export declare const resolveModuleVersion: (module: KnownModule, versions?: Dependency[]) => Dependency | SubDependency | undefined;
export {};
//# sourceMappingURL=moduleVersion.d.ts.map