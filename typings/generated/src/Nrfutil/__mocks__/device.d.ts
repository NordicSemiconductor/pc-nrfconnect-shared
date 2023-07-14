/// <reference types="jest" />
declare const getDeviceLib: () => Promise<{
    program: jest.Mock<any, any, any>;
    programBuffer: jest.Mock<any, any, any>;
    erase: jest.Mock<any, any, any>;
    recover: jest.Mock<any, any, any>;
    reset: jest.Mock<any, any, any>;
    getProtectionStatus: jest.Mock<any, any, any>;
    setProtectionStatus: jest.Mock<any, any, any>;
    fwInfo: jest.Mock<any, any, any>;
    setMcuState: jest.Mock<any, any, any>;
    coreInfo: jest.Mock<any, any, any>;
    list: jest.Mock<{
        stop: jest.Mock<any, any, any>;
    }, [], any>;
    firmwareRead: jest.Mock<any, any, any>;
    onLogging: jest.Mock<any, any, any>;
    setLogLevel: jest.Mock<any, any, any>;
    setVerboseLogging: jest.Mock<any, any, any>;
    getModuleVersion: jest.Mock<any, any, any>;
}>;
export default getDeviceLib;
