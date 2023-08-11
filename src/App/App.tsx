/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import 'focus-visible';

import React, { FC, ReactNode, useEffect, useMemo, useRef } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Reducer } from 'redux';

import { inMain as openWindow } from '../../ipc/openWindow';
import { setDeviceLogger } from '../../nrfutil/device/deviceLogger';
import About from '../About/About';
import BrokenDeviceDialog from '../Device/BrokenDeviceDialog/BrokenDeviceDialog';
import { setAutoReselect } from '../Device/deviceAutoSelectSlice';
import {
    getDevices,
    selectedDevice as selectedDeviceSelector,
    selectedSerialNumber as selectedSerialNumberSelector,
} from '../Device/deviceSlice';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import ErrorDialog from '../ErrorDialog/ErrorDialog';
import FlashMessages from '../FlashMessage/FlashMessage';
import LogViewer from '../Log/LogViewer';
import logger from '../logging';
import NavBar from '../NavBar/NavBar';
import FeedbackPane, { FeedbackPaneProps } from '../Panes/FeedbackPane';
import classNames from '../utils/classNames';
import packageJson from '../utils/packageJson';
import { getPersistedCurrentPane } from '../utils/persistentStore';
import { init as usageDataInit, setUsageLogger } from '../utils/usageData';
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
import './tailwind.css';

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
    feedback?: boolean | FeedbackPaneProps;
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
    feedback,
    children,
    autoReselectByDefault = false,
}) => {
    const initialisedLogger = useRef(false);

    if (!initialisedLogger.current) {
        logger.initialise();
        setDeviceLogger(logger);
        setUsageLogger(logger);
        initialisedLogger.current = true;
    }

    usePersistedPane();
    const isLogVisible = useSelector(isLogVisibleSelector);
    const currentPane = useSelector(currentPaneSelector);
    const allPanes = useAllPanes(panes, documentation, feedback);
    const dispatch = useDispatch();

    useHotKey({
        hotKey: 'alt+l',
        title: 'Open launcher',
        isGlobal: true,
        action: openWindow.openLauncher,
    });

    useEffect(() => {
        dispatch(setAutoReselect(autoReselectByDefault));
    }, [dispatch, autoReselectByDefault]);

    useEffect(() => {
        if (!showLogByDefault) {
            dispatch(toggleLogVisible());
        }
    }, [dispatch, showLogByDefault]);

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
                <FlashMessages />
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

export default ({
    appReducer,
    ...props
}: { appReducer?: Reducer } & ConnectedAppProps) => (
    <ConnectedToStore appReducer={appReducer}>
        <ConnectedErrorBoundary>
            <ConnectedApp {...props} />
        </ConnectedErrorBoundary>
    </ConnectedToStore>
);

const usePersistedPane = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const pane = getPersistedCurrentPane() ?? 0;
        dispatch(setCurrentPane(pane));
    }, [dispatch]);
};

const useAllPanes = (
    panes: Pane[],
    documentation: ReactNode[] | undefined,
    feedback: boolean | FeedbackPaneProps | undefined
) => {
    const dispatch = useDispatch();

    const allPanes = useMemo(() => {
        const newPanes = [...panes];

        if (feedback) {
            newPanes.push({
                name: 'Feedback',
                Main: props => (
                    <FeedbackPane
                        {...(typeof feedback === 'object'
                            ? feedback
                            : undefined)}
                        {...props}
                    />
                ),
            });
        }

        newPanes.push({
            name: 'About',
            Main: props => <About documentation={documentation} {...props} />,
        });

        return newPanes;
    }, [panes, documentation, feedback]);

    useEffect(() => {
        dispatch(setPanes(allPanes));
    }, [dispatch, allPanes]);

    return allPanes;
};

export const render = (App: React.ReactElement) => {
    const container = document.getElementById('webapp');
    if (container == null) {
        throw new Error('Unable to find root element <div id="webapp"></div>');
    }
    ReactDOM.render(App, container);
};
