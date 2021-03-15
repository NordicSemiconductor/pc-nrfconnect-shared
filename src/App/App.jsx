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

import 'focus-visible';

import React, { useEffect, useMemo } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { useDispatch, useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import {
    array,
    arrayOf,
    bool,
    elementType,
    exact,
    func,
    node,
    oneOfType,
    string,
} from 'prop-types';

import About from '../About/About';
import AppReloadDialog from '../AppReload/AppReloadDialog';
import ErrorDialog from '../ErrorDialog/ErrorDialog';
import LogViewer from '../Log/LogViewer';
import NavBar from '../NavBar/NavBar';
import useHotKey from '../utils/useHotKey';
import {
    currentPane as currentPaneSelector,
    isLogVisible as isLogVisibleSelector,
    isSidePanelVisible as isSidePanelVisibleSelector,
    setPanes,
    toggleLogVisible,
} from './appLayout';
import ConnectedToStore from './ConnectedToStore';
import VisibilityBar from './VisibilityBar';

import './shared.scss';
import './app.scss';

const hiddenUnless = isVisible => (isVisible ? '' : 'hidden');

let warnedAboutLegacyPanes = false;
const convertLegacy = pane => {
    const isLegacyPane = Array.isArray(pane);
    if (!isLegacyPane) {
        return pane;
    }

    if (!warnedAboutLegacyPanes) {
        console.warn(
            `Passed legacy definition for pane '${pane[0]}' which will be deprecated and removed in the future.`
        );
        warnedAboutLegacyPanes = true;
    }

    return {
        name: pane[0],
        Main: pane[1],
    };
};

const ConnectedApp = ({
    deviceSelect,
    panes,
    sidePanel,
    showLogByDefault = true,
}) => {
    const allPanes = useMemo(
        () => [...panes, { name: 'About', Main: About }].map(convertLegacy),
        [panes]
    );
    const isSidePanelVisible =
        useSelector(isSidePanelVisibleSelector) && sidePanel;
    const isLogVisible = useSelector(isLogVisibleSelector);
    const currentPane = useSelector(currentPaneSelector);
    const dispatch = useDispatch();

    useHotKey('alt+l', () => ipcRenderer.send('open-app-launcher'));

    useEffect(() => {
        if (!showLogByDefault) {
            dispatch(toggleLogVisible());
        }
    }, [dispatch, showLogByDefault]);

    useEffect(() => {
        dispatch(setPanes(allPanes));
    }, [dispatch, allPanes]);

    return (
        <div className="core19-app">
            <NavBar deviceSelect={deviceSelect} />
            <div className="core19-app-content">
                <div
                    className={`core19-side-panel-container ${hiddenUnless(
                        isSidePanelVisible
                    )}`}
                >
                    {sidePanel}
                </div>
                <div className="core19-main-and-log">
                    <Carousel
                        className="core19-main-container"
                        activeIndex={currentPane}
                        controls={false}
                        indicators={false}
                        keyboard={false}
                        interval={null}
                        slide
                        fade
                    >
                        {allPanes.map(({ name, Main }, paneIndex) => (
                            <Carousel.Item key={name}>
                                <Main active={paneIndex === currentPane} />
                            </Carousel.Item>
                        ))}
                    </Carousel>
                    <div
                        className={`core19-log-viewer ${hiddenUnless(
                            isLogVisible
                        )}`}
                    >
                        <LogViewer />
                    </div>
                </div>
            </div>
            <VisibilityBar isSidePanelEnabled={sidePanel !== null} />

            <AppReloadDialog />
            <ErrorDialog />
        </div>
    );
};

const LegacyPanePropType = array;

const PanePropType = exact({
    name: string.isRequired,
    Main: elementType.isRequired,
});

ConnectedApp.propTypes = {
    deviceSelect: node,
    panes: arrayOf(oneOfType([LegacyPanePropType, PanePropType]).isRequired)
        .isRequired,
    sidePanel: node,
    showLogByDefault: bool,
};

const noopReducer = (state = null) => state;
const App = ({ appReducer = noopReducer, ...props }) => (
    <ConnectedToStore appReducer={appReducer}>
        <ConnectedApp {...props} />
    </ConnectedToStore>
);

App.propTypes = {
    appReducer: func,
};

export default App;
