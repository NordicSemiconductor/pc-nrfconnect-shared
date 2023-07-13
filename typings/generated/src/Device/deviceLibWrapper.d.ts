import { Dependency, SubDependency } from '../Nrfutil/sandboxTypes';
type KnownModule = 'nrfdl' | 'jprog' | 'JlinkARM';
export declare const getModuleVersion: (module: KnownModule, versions?: Dependency[]) => Dependency | SubDependency | undefined;
export {};
