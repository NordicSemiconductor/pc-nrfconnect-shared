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

import React, { useEffect } from 'react';
import {
    array, arrayOf, func, node,
} from 'prop-types';
import { useSelector } from 'react-redux';

import Mousetrap from 'mousetrap';
import { ipcRenderer } from 'electron';

import LogViewer from '../Log/LogViewer';

import ErrorDialog from '../ErrorDialog/ErrorDialog';
import AppReloadDialog from '../AppReload/AppReloadDialog';
import NavBar from '../NavBar/NavBar';
import VisibilityBar from './VisibilityBar';
import ConnectedToStore from './ConnectedToStore';
import { isSidePanelVisibleSelector, isLogVisibleSelector, mainComponentSelector } from './appLayout';

import './shared.scss';
import './app.scss';

const ConnectedApp = ({
    deviceSelect, panes, sidePanel,
}) => {
    const isSidePanelVisible = useSelector(isSidePanelVisibleSelector);
    const isLogVisible = useSelector(isLogVisibleSelector);
    const MainComponent = useSelector(mainComponentSelector(panes));

    useEffect(() => {
        Mousetrap.bind('alt+l', () => ipcRenderer.send('open-app-launcher'));
    }, []);

    return (
        <div className="core19-app">
            <NavBar
                deviceSelect={deviceSelect}
                panes={panes}
            />
            <div className="core19-app-content">
                {isSidePanelVisible && (
                    <div className="core19-side-panel">
                        {sidePanel}
                    </div>
                )}
                <div className="core19-main-and-log">
                    <div className="core19-main-container"><MainComponent /></div>
                    {isLogVisible && <LogViewer />}
                </div>
            </div>
            <VisibilityBar />

            <AppReloadDialog />
            <ErrorDialog />
        </div>
    );
};

ConnectedApp.propTypes = {
    deviceSelect: node.isRequired,
    panes: arrayOf(array.isRequired).isRequired,
    sidePanel: node.isRequired,
};

const App = ({ appReducer, ...props }) => (
    <ConnectedToStore appReducer={appReducer}>
        <ConnectedApp {...props} />
    </ConnectedToStore>
);

App.propTypes = {
    appReducer: func.isRequired,
};

export default App;
