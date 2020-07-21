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

// This file must be kept in sync with 'variables.scss' in the same folder

const nordicBlue = '#00a9ce';
const blueSlate = '#0033a0';

export default {
    nordicBlue,
    blueSlate,

    primary: nordicBlue,
    primaryDarkened: '#0098b9', // result of using color.scale($nordic-blue, $lightness: -10%) in sass
    secondary: 'white',
    accent: blueSlate,

    gray50: '#eceff1',
    gray100: '#cfd8dc',
    gray200: '#b0bec5',
    gray300: '#90a4ae',
    gray400: '#78909c',
    gray500: '#607d8b',
    gray600: '#546e7a',
    gray700: '#455a64',
    gray800: '#37474f',
    gray900: '#263238',

    red: '#f44336',
    indigo: '#3f51b5',
    amber: '#ffc107',
    purple: '#9c27b0',
    green: '#4caf50',
    deepPurple: '#673ab7',
    orange: '#ff9800',
    lime: '#cddc39',
    pink: '#e91e63',

    blueSlateLighter: '#7c98d3', // result of using color.scale($blue-slate, $lightness: 50%, $saturation: -50%) in sass
    greenLighter: '#b1cbb3', // result of using color.scale($green, $lightness: 50%, $saturation: -50%) in sass
};
