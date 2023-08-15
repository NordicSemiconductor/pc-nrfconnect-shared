import { DeviceCore } from './common';
import {
    isJLinkProgrammingOptions,
    isMcuBootProgrammingOptions,
    isNordicDfuProgrammingOptions,
    ProgrammingOptions,
} from './program';

export const convertDeviceCoreType = (core?: DeviceCore) => {
    switch (core) {
        case 'Application':
            return 'NRFDL_DEVICE_CORE_APPLICATION';
        case 'Network':
            return 'NRFDL_DEVICE_CORE_NETWORK';
        case 'Modem':
            return 'NRFDL_DEVICE_CORE_MODEM';
    }
};

export const convertProgrammingOptionsType = (
    programmingOptions?: ProgrammingOptions
) => {
    if (!programmingOptions) {
        return undefined;
    }

    if (isJLinkProgrammingOptions(programmingOptions)) {
        return {
            qspi_erase_mode: programmingOptions.chipEraseMode,
            reset: programmingOptions.reset,
            verify: programmingOptions.verify,
        };
    }

    if (isMcuBootProgrammingOptions(programmingOptions)) {
        return {
            mcu_end_state: programmingOptions.mcuEndState,
            net_core_upload_delay: programmingOptions.netCoreUploadDelay,
        };
    }

    if (isNordicDfuProgrammingOptions(programmingOptions)) {
        return {
            mcu_end_state: programmingOptions.mcuEndState,
        };
    }

    // if none was applied I suggest log some warning/error here
    // just in case
};
