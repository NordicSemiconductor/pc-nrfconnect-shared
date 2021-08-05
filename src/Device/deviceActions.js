/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Indicates that a device has been selected.
 *
 * @param {Object} device Device object as given by nrf-device-lib.
 */
export const DEVICE_SELECTED = 'DEVICE_SELECTED';
export const selectDevice = device => ({
    type: DEVICE_SELECTED,
    device,
});

/**
 * Indicates that the currently selected device has been deselected.
 */
export const DEVICE_DESELECTED = 'DEVICE_DESELECTED';
export function deselectDevice() {
    return {
        type: DEVICE_DESELECTED,
    };
}

/**
 * Indicates that device setup is complete. This means that the device is
 * ready for use according to the `config.deviceSetup` configuration provided
 * by the app.
 *
 * @param {Object} device Device object as given by nrf-device-lib.
 */
export const DEVICE_SETUP_COMPLETE = 'DEVICE_SETUP_COMPLETE';
export const deviceSetupComplete = device => ({
    type: DEVICE_SETUP_COMPLETE,
    device,
});

/**
 * Indicates that device setup failed.
 *
 * @param {Object} device Device object as given by nrf-device-lib.
 * @param {Object} error Error object describing the error.
 */
export const DEVICE_SETUP_ERROR = 'DEVICE_SETUP_ERROR';
export const deviceSetupError = (device, error) => ({
    type: DEVICE_SETUP_ERROR,
    device,
    error,
});

/**
 * Indicates that some part of the device setup operation requires input
 * from the user. When the user has provided the required input, then
 * DEVICE_SETUP_INPUT_RECEIVED is dispatched with the given input.
 *
 * @param {String} message The message to display to the user.
 * @param {Array<String>} [choices] Values that the user can choose from (optional).
 */
export const DEVICE_SETUP_INPUT_REQUIRED = 'DEVICE_SETUP_INPUT_REQUIRED';
export const deviceSetupInputRequired = (message, choices) => ({
    type: DEVICE_SETUP_INPUT_REQUIRED,
    message,
    choices,
});

/**
 * Indicates that the user has provided input to the device setup operation.
 * This action is dispatched after DEVICE_SETUP_INPUT_REQUIRED.
 *
 * @param {Boolean|String} input The input made by the user.
 */
export const DEVICE_SETUP_INPUT_RECEIVED = 'DEVICE_SETUP_INPUT_RECEIVED';
export const deviceSetupInputReceived = input => ({
    type: DEVICE_SETUP_INPUT_RECEIVED,
    input,
});

/**
 * Indicates that devices have been detected. This is triggered by default at
 * startup, and whenever a device is attached/detached. The app can configure
 * which devices to look for by providing a `config.selectorTraits` property.
 *
 * @param {Array} devices Array of all attached devices, ref. nrf-device-lib.
 */
export const DEVICES_DETECTED = 'DEVICES_DETECTED';
export const devicesDetected = devices => ({
    type: DEVICES_DETECTED,
    devices,
});

export const DEVICE_FAVORITE_TOGGLED = 'DEVICE_FAVORITE_TOGGLED';
export const toggleDeviceFavorited = serialNumber => ({
    type: DEVICE_FAVORITE_TOGGLED,
    serialNumber,
});

export const DEVICE_NICKNAME_SET = 'DEVICE_NICKNAME_SET';
export const setDeviceNickname = (serialNumber, nickname) => ({
    type: DEVICE_NICKNAME_SET,
    serialNumber,
    nickname,
});

export const DEVICE_NICKNAME_RESET = 'DEVICE_NICKNAME_RESET';
export const resetDeviceNickname = serialNumber => ({
    type: DEVICE_NICKNAME_RESET,
    serialNumber,
});
