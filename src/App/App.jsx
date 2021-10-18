/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
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
import { setDocumentationSections } from '../About/documentationSlice';
import AppReloadDialog from '../AppReload/AppReloadDialog';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import ErrorDialog from '../ErrorDialog/ErrorDialog';
import LogViewer from '../Log/LogViewer';
import NavBar from '../NavBar/NavBar';
import classNames from '../utils/classNames';
import logLibVersions from '../utils/logLibVersions';
import packageJson from '../utils/packageJson';
import usageData from '../utils/usageData';
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

logLibVersions();

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

let usageDataAlreadyInitialised = false;
const initialiseUsageData = async () => {
    if (!usageDataAlreadyInitialised) {
        usageDataAlreadyInitialised = true;
        try {
            await usageData.init(packageJson());
        } catch (error) {
            // No need to display the error message for the user
            console.log(error);
        }
    }
};

const ConnectedApp = ({
    deviceSelect,
    panes,
    sidePanel,
    showLogByDefault = true,
    reportUsageData = false,
    documentation,
    children,
}) => {
    const allPanes = useMemo(
        () => [...panes, { name: 'About', Main: About }].map(convertLegacy),
        [panes]
    );
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

    useEffect(() => {
        if (documentation) dispatch(setDocumentationSections(documentation));
    }, [dispatch, documentation]);

    const SidePanelComponent = allPanes[currentPane].SidePanel;
    const currentSidePanel =
        SidePanelComponent != null ? <SidePanelComponent /> : sidePanel;

    const isSidePanelVisible =
        useSelector(isSidePanelVisibleSelector) && currentSidePanel;

    useEffect(() => {
        if (reportUsageData) {
            initialiseUsageData();
        }
    }, [reportUsageData]);

    return (
        <div className="core19-app">
            <NavBar deviceSelect={deviceSelect} />
            <div className="core19-app-content">
                <div
                    className={classNames(
                        'core19-side-panel-container',
                        isSidePanelVisible || 'hidden'
                    )}
                >
                    {currentSidePanel}
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
                        className={classNames(
                            'core19-log-viewer',
                            isLogVisible || 'hidden'
                        )}
                    >
                        <LogViewer />
                    </div>
                </div>
            </div>
            <VisibilityBar isSidePanelEnabled={sidePanel !== null} />

            <AppReloadDialog />
            <ErrorDialog />
            {children}
        </div>
    );
};

const LegacyPanePropType = array;

const PanePropType = exact({
    name: string.isRequired,
    Main: elementType.isRequired,
    SidePanel: elementType,
});

const DocumentationPropType = exact({
    title: string,
    linkLabel: string,
    link: string,
});

ConnectedApp.propTypes = {
    deviceSelect: node,
    panes: arrayOf(oneOfType([LegacyPanePropType, PanePropType]).isRequired)
        .isRequired,
    sidePanel: node,
    showLogByDefault: bool,
    reportUsageData: bool,
    documentation: arrayOf(DocumentationPropType),
    children: node,
};

const noopReducer = (state = null) => state;
const App = ({ appReducer = noopReducer, ...props }) => (
    <ConnectedToStore appReducer={appReducer}>
        <ErrorBoundary>
            <ConnectedApp {...props} />
        </ErrorBoundary>
    </ConnectedToStore>
);

App.propTypes = {
    appReducer: func,
};

export default App;
