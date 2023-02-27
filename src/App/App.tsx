/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import 'focus-visible';

import React, { FC, ReactNode, useEffect, useMemo } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { useDispatch, useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import { func } from 'prop-types';
import { Reducer } from 'redux';

import About from '../About/About';
import { setDocumentationSections } from '../About/documentationSlice';
import BrokenDeviceDialog from '../Device/BrokenDeviceDialog/BrokenDeviceDialog';
import { setGlobalAutoReselect } from '../Device/deviceAutoSelectSlice';
import {
    getDevices,
    selectedDevice as selectedDeviceSelector,
    selectedSerialNumber as selectedSerialNumberSelector,
} from '../Device/deviceSlice';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import ErrorDialog from '../ErrorDialog/ErrorDialog';
import LogViewer from '../Log/LogViewer';
import NavBar from '../NavBar/NavBar';
import classNames from '../utils/classNames';
import packageJson from '../utils/packageJson';
import { getPersistedCurrentPane } from '../utils/persistentStore';
import { init as usageDataInit } from '../utils/usageData';
import useHotKey from '../utils/useHotKey';
import {
    currentPane as currentPaneSelector,
    isLogVisible as isLogVisibleSelector,
    isSidePanelVisible as isSidePanelVisibleSelector,
    setCurrentPane,
    setPanes,
    toggleLogVisible,
} from './appLayout';
import ConnectedToStore from './ConnectedToStore';
import VisibilityBar from './VisibilityBar';

import './app.scss';
import './shared.scss';

type LegacyPane = [string, FC];
let warnedAboutLegacyPanes = false;
const convertLegacy = (pane: Pane | LegacyPane): Pane => {
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
const initialiseUsageData = () => {
    if (!usageDataAlreadyInitialised) {
        usageDataAlreadyInitialised = true;
        try {
            usageDataInit(packageJson());
        } catch (error) {
            // No need to display the error message for the user
            console.log(error);
        }
    }
};

export interface PaneProps {
    active: boolean;
}

export interface Pane {
    name: string;
    Main: FC<PaneProps>;
    SidePanel?: FC;
}

interface ConnectedAppProps {
    deviceSelect?: ReactNode;
    panes: Pane[];
    sidePanel?: ReactNode;
    showLogByDefault?: boolean;
    reportUsageData?: boolean;
    documentation?: ReactNode[];
    children?: ReactNode;
    autoReselectByDefault?: boolean;
}

const ConnectedApp: FC<ConnectedAppProps> = ({
    deviceSelect,
    panes,
    sidePanel,
    showLogByDefault = true,
    reportUsageData = false,
    documentation,
    children,
    autoReselectByDefault = false,
}) => {
    usePersistedPane();
    const isLogVisible = useSelector(isLogVisibleSelector);
    const currentPane = useSelector(currentPaneSelector);
    const allPanes = useAllPanes(panes);
    const dispatch = useDispatch();

    useHotKey({
        hotKey: 'alt+l',
        title: 'Open launcher',
        isGlobal: true,
        action: () => ipcRenderer.send('open-app-launcher'),
    });

    useEffect(() => {
        dispatch(setGlobalAutoReselect(autoReselectByDefault));
    }, [dispatch, autoReselectByDefault]);

    useEffect(() => {
        if (!showLogByDefault) {
            dispatch(toggleLogVisible());
        }
    }, [dispatch, showLogByDefault]);

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

            <ErrorDialog />
            <BrokenDeviceDialog />
            {children}
        </div>
    );
};

const ConnectedErrorBoundary: React.FC = ({ children }) => {
    const devices = useSelector(getDevices);
    const selectedDevice = useSelector(selectedDeviceSelector);
    const selectedSerialNumber = useSelector(selectedSerialNumberSelector);

    return (
        <ErrorBoundary
            devices={[...devices.values()]}
            selectedDevice={selectedDevice}
            selectedSerialNumber={selectedSerialNumber ?? undefined}
        >
            {children}
        </ErrorBoundary>
    );
};

const App = ({
    appReducer,
    ...props
}: { appReducer?: Reducer } & ConnectedAppProps) => (
    <ConnectedToStore appReducer={appReducer}>
        <ConnectedErrorBoundary>
            <ConnectedApp {...props} />
        </ConnectedErrorBoundary>
    </ConnectedToStore>
);

App.propTypes = {
    appReducer: func,
};

export default App;

const usePersistedPane = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const pane = getPersistedCurrentPane() ?? 0;
        dispatch(setCurrentPane(pane));
    }, [dispatch]);
};

const useAllPanes = (panes: (Pane | LegacyPane)[]) => {
    const dispatch = useDispatch();

    const allPanes = useMemo(
        () => [...panes, { name: 'About', Main: About }].map(convertLegacy),
        [panes]
    );

    useEffect(() => {
        dispatch(setPanes(allPanes));
    }, [dispatch, allPanes]);

    return allPanes;
};
