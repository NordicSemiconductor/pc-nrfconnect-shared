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
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA 'AS IS' AND ANY EXPRESS OR
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

import {
    bool, func, node, number, oneOf, string,
} from 'prop-types';
import React, { useState } from 'react';

import './toggle.scss';

const Toggle = ({
    id,
    isToggled,
    onToggle,
    label,
    labelRight = false,
    variant = 'primary',
    barColor,
    barColorToggled,
    handleColor,
    handleColorToggled,
    width,
    disabled = false,
    children,
}) => {
    const [toggled, setToggled] = useState(isToggled || false);
    const isPrimary = variant === 'primary';
    const isSecondary = variant === 'secondary';

    const handleToggle = () => {
        console.log(toggled);
        if (onToggle) {
            onToggle();
        }
        setToggled(!toggled);
    };

    const toggleBarClassName = [
        'toggle-bar',
        isPrimary ? 'toggle-bar-primary' : '',
        isSecondary ? 'toggle-bar-secondary' : '',
    ];

    const toggleBarStyle = {
        backgroundColor: toggled ? barColorToggled : barColor,
    };

    const toggleHandleClassName = [
        'toggle-handle',
        isPrimary ? 'toggle-handle-primary' : '',
        isSecondary ? 'toggle-handle-secondary' : '',
        toggled ? 'toggle-handle-toggled' : '',
        toggled && isPrimary ? 'toggle-handle-primary-toggled' : '',
        toggled && isSecondary ? 'toggle-handle-secondary-toggled' : '',
    ];

    const toggleHandleStyle = {
        backgroundColor: toggled ? handleColorToggled : handleColor,
    };

    const labelElement = (
        <span className="toggle-label">{children || label}</span>
    );

    return (
        <div className="toggle" style={{ width }}>
            <label htmlFor={id}>
                {!labelRight && labelElement}
                <div
                    className={toggleBarClassName.join(' ')}
                    style={toggleBarStyle}
                >
                    <input
                        id={id}
                        type="checkbox"
                        checked={toggled}
                        onChange={disabled ? null : handleToggle}
                        aria-checked={toggled}
                        disabled={disabled}
                    />
                    <span
                        className={toggleHandleClassName.join(' ')}
                        style={toggleHandleStyle}
                    />
                </div>
                {labelRight && labelElement}
            </label>
        </div>
    );
};

Toggle.propTypes = {
    id: string,
    isToggled: bool,
    onToggle: func,
    variant: oneOf(['primary', 'secondary']),
    barColor: string,
    barColorToggled: string,
    handleColor: string,
    handleColorToggled: string,
    label: string,
    labelRight: bool,
    width: string,
    disabled: bool,
    children: node,
};

export default Toggle;
