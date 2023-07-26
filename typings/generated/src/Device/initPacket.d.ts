/// <reference types="node" />
import protobuf from 'protobufjs';
export declare enum FwType {
    APPLICATION = 0,
    SOFTDEVICE = 1,
    BOOTLOADER = 2,
    SOFTDEVICE_BOOTLOADER = 3
}
export declare enum HashType {
    NO_HASH = 0,
    CRC = 1,
    SHA128 = 2,
    SHA256 = 3,
    SHA512 = 4
}
export declare const OpCode: {
    RESET: number;
    INIT: number;
};
export declare const SignatureType: {
    ECDSA_P256_SHA256: number;
    ED25519: number;
};
export interface InitPacket {
    fwVersion?: number;
    hwVersion?: number;
    sdReq?: number[];
    fwType?: number;
    sdSize: number;
    blSize: number;
    appSize: number;
    hashType: number;
    hash?: Buffer;
    isDebug: boolean;
    signatureType?: number;
    signature?: [];
}
export declare const defaultInitPacket: InitPacket;
export interface DfuImage {
    name: string;
    initPacket: InitPacket;
    firmwareImage: Buffer;
}
/**
 * Create reset command packet
 *
 * @param {Integer} timeout         the timeout for reset
 * @param {Integer} signatureType   the type of signature
 * @param {Array}   signature       the signature in bytes
 *
 * @returns {protobuf.Message | undefined} reset command packet
 */
export declare const createResetPacket: (timeout: number, signatureType: number, signature: []) => protobuf.Message;
/**
 * Create reset command buffer
 *
 * @param {Integer} timeout         the timeout for reset
 * @param {Integer} signatureType   the type of signature
 * @param {Array}   signature       the signature in bytes
 *
 * @returns {Uint8Array} converted from reset command packet
 */
export declare const createResetPacketBuffer: (timeout: number, signatureType: number, signature: []) => Uint8Array;
/**
 * Create init command packet
 *
 * @param {Integer}         fwVersion       the firmware version
 * @param {Integer}         hwVersion       the hardware version
 * @param {Array}           sdReq           the softdevice requirements
 * @param {FwType}          fwType          the firmware type
 * @param {Integer}         sdSize          the size of softDevice
 * @param {Integer}         blSize          the size of bootloader
 * @param {Integer}         appSize         the size of application
 * @param {HashType}        hashType        the type of hash
 * @param {Array}           hash            the hash in bytes
 * @param {Boolean}         isDebug         whether it is in debug mode or not
 * @param {SignatureType}   signatureType   the type of signature
 * @param {Array}           signature       the signature in bytes
 *
 * @returns {protobuf.Message} init command packet
 */
export declare const createInitPacket: (fwVersion: number | undefined, hwVersion: number | undefined, sdReq: number[] | undefined, fwType: number | undefined, sdSize: number | undefined, blSize: number | undefined, appSize: number | undefined, hashType: number | undefined, hash: Buffer | undefined, isDebug: boolean, signatureType: number | undefined, signature: [] | undefined) => protobuf.Message;
/**
 * Create init command buffer
 *
 * @param {Integer}         fwVersion       the firmware version
 * @param {Integer}         hwVersion       the hardware version
 * @param {Array}           sdReq           the softdevice requirements
 * @param {FwType}          fwType          the firmware type
 * @param {Integer}         sdSize          the size of softdevice
 * @param {Integer}         blSize          the size of bootloader
 * @param {Integer}         appSize         the size of application
 * @param {HashType}        hashType        the type of hash
 * @param {Array}           hash            the hash in bytes
 * @param {Boolean}         isDebug         whether it is in debug mode or not
 * @param {SignatureType}   signatureType   the type of signature
 * @param {Array}           signature       the signature in bytes
 *
 * @returns {Uint8Array} converted from init command packet
 */
export declare const createInitPacketBuffer: (fwVersion: number, hwVersion: number, sdReq: number[], fwType: number, sdSize: number, blSize: number, appSize: number, hashType: number, hash: Buffer, isDebug: boolean, signatureType: number, signature: []) => Buffer;
/**
 * Create init command packet Uint8Array
 *
 * @param {InitPacket} packetParams the InitPacket which carries all information
 *
 * @returns {Uint8Array} converted from init command packet buffer
 */
export declare const createInitPacketUint8Array: (packetParams: InitPacket) => Uint8Array;
//# sourceMappingURL=initPacket.d.ts.map