/// <reference types="jest" />
declare const program: jest.Mock<any, any, any>;
declare const programBuffer: jest.Mock<any, any, any>;
declare const erase: jest.Mock<any, any, any>;
declare const recover: jest.Mock<any, any, any>;
declare const reset: jest.Mock<any, any, any>;
declare const getProtectionStatus: jest.Mock<any, any, any>;
declare const setProtectionStatus: jest.Mock<any, any, any>;
declare const getFwInfo: jest.Mock<any, any, any>;
declare const setMcuState: jest.Mock<any, any, any>;
declare const getCoreInfo: jest.Mock<any, any, any>;
declare const list: jest.Mock<{
    stop: jest.Mock<any, any, any>;
}, [], any>;
declare const firmwareRead: jest.Mock<any, any, any>;
declare const onLogging: jest.Mock<any, any, any>;
declare const setLogLevel: jest.Mock<any, any, any>;
declare const setVerboseLogging: jest.Mock<any, any, any>;
declare const getModuleVersion: jest.Mock<any, any, any>;
export { program, programBuffer, erase, recover, reset, getProtectionStatus, setProtectionStatus, getFwInfo, setMcuState, getCoreInfo, list, firmwareRead, onLogging, setLogLevel, setVerboseLogging, getModuleVersion, };
