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

import React from 'react';
import { bool } from 'prop-types';
import Form from 'react-bootstrap/Form';
import { useDispatch, useSelector } from 'react-redux';
import { autoScroll as autoScrollSelector } from '../Log/logReducer';
import { clear, toggleAutoScroll } from '../Log/logActions';
import logger from '../logging';
import {
    isSidePanelVisibleSelector,
    isLogVisibleSelector,
    toggleSidePanelVisible,
    toggleLogVisible,
} from './appLayout';

import './visibility-bar.scss';

const VisibilityBar = ({ isSidePanelEnabled }) => {
    const dispatch = useDispatch();
    const isSidePanelVisible = useSelector(isSidePanelVisibleSelector);
    const isLogVisible = useSelector(isLogVisibleSelector);
    const autoScroll = useSelector(autoScrollSelector);

    return (
        <div className="core19-visibility-bar">
            {isSidePanelEnabled && (
                <div className={`core19-visibility-bar-show-side-panel ${isSidePanelVisible ? '' : 'panel-hidden'}`}>
                    <Form.Switch
                        id="visibility-bar-show-side-panel"
                        label="Show side panel"
                        checked={isSidePanelVisible}
                        onChange={() => dispatch(toggleSidePanelVisible())}
                    />
                </div>
            )}
            <div className="core19-visibility-bar-show-log">
                <button
                    type="button"
                    className="log-button"
                    onClick={() => dispatch(clear())}
                >
                    Clear log
                </button>
                <button
                    type="button"
                    className="log-button"
                    onClick={logger.openLogFile}
                >
                    Open log file
                </button>
                <div className="flex-grow-1" />
                <Form.Switch
                    className="log-switch"
                    id="autoscroll-log"
                    label="Autoscroll log"
                    checked={autoScroll}
                    onChange={() => dispatch(toggleAutoScroll())}
                />
                <Form.Switch
                    className="log-switch"
                    id="visibility-bar-show-log"
                    label="Show log"
                    checked={isLogVisible}
                    onChange={() => dispatch(toggleLogVisible())}
                />
            </div>
        </div>
    );
};

VisibilityBar.propTypes = {
    isSidePanelEnabled: bool.isRequired,
};

export default VisibilityBar;
