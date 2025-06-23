/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import 'focus-visible';

import React, { FC, ReactNode, useEffect, useMemo, useRef } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { createRoot } from 'react-dom/client';
import { useDispatch, useSelector } from 'react-redux';
import { Reducer } from 'redux';

import { inMain as open } from '../../ipc/open';
import { setNrfutilLogger } from '../../nrfutil/nrfutilLogger';
import About from '../About/About';
import ConfirmCloseDialog from '../ConfirmBeforeClose/ConfirmCloseDialog';
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
import telemetry from '../telemetry/telemetry';
import classNames from '../utils/classNames';
import {
    getPersistedCurrentPane,
    getPersistedLogVisible,
} from '../utils/persistentStore';
import useHotKey from '../utils/useHotKey';
import {
    AboutPaneName,
    currentPane as currentPaneSelector,
    isLogVisible as isLogVisibleSelector,
    isSidePanelVisible as isSidePanelVisibleSelector,
    setCurrentPane,
    setLogVisible,
    setPanes,
} from './appLayout';
import ConnectedToStore from './ConnectedToStore';
import VisibilityBar from './VisibilityBar';

import './app.scss';
import './shared.scss';
import './tailwind.css';

export interface PaneProps {
    active: boolean;
}

export interface Pane {
    name: string;
    preHidden?: boolean;
    preDisabled?: boolean;
    Main: FC<PaneProps>;
    SidePanel?: FC;
}

interface ConnectedAppProps {
    deviceSelect?: ReactNode;
    panes: Pane[];
    sidePanel?: ReactNode;
    showLogByDefault?: boolean;
    documentation?: ReactNode[];
    feedbackCategories?: string[];
    children?: ReactNode;
    autoReselectByDefault?: boolean;
}

const ConnectedApp: FC<ConnectedAppProps> = ({
    deviceSelect,
    panes,
    sidePanel,
    showLogByDefault = true,
    documentation,
    feedbackCategories,
    children,
    autoReselectByDefault = false,
}) => {
    const initApp = useRef(false);

    if (!initApp.current) {
        logger.initialise();
        setNrfutilLogger(logger);
        telemetry.setLogger(logger);
        initApp.current = true;
    }

    usePersistedPane();
    const isLogVisible = useSelector(isLogVisibleSelector);
    const currentPane = useSelector(currentPaneSelector);
    const allPanes = useAllPanes(panes, documentation, feedbackCategories);
    const currentPaneIndex = allPanes.findIndex(p => p.name === currentPane);
    const dispatch = useDispatch();

    useHotKey({
        hotKey: 'alt+l',
        title: 'Open launcher',
        isGlobal: true,
        action: open.openLauncher,
    });

    useEffect(() => {
        if (currentPane) {
            telemetry.sendPageView(currentPane);
        }
    }, [currentPane]);

    useEffect(() => {
        dispatch(setAutoReselect(autoReselectByDefault));
    }, [dispatch, autoReselectByDefault]);

    useEffect(() => {
        const persistedLogVisible = getPersistedLogVisible();
        // If they are equal, the current setting is already correct
        // getPersistedLogVisible is used to initialise the redux state
        if (showLogByDefault !== getPersistedLogVisible()) {
            if (persistedLogVisible !== undefined) {
                dispatch(setLogVisible(persistedLogVisible));
            } else {
                dispatch(setLogVisible(showLogByDefault));
            }
        }
    }, [dispatch, showLogByDefault]);

    const SidePanelComponent =
        currentPaneIndex >= 0 ? allPanes[currentPaneIndex].SidePanel : null;
    const currentSidePanel =
        SidePanelComponent != null ? <SidePanelComponent /> : sidePanel;

    const isSidePanelVisible =
        useSelector(isSidePanelVisibleSelector) && currentSidePanel;

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
                        activeIndex={currentPaneIndex}
                        controls={false}
                        indicators={false}
                        keyboard={false}
                        interval={null}
                        slide
                        fade
                    >
                        {allPanes.map(({ name, Main }) => (
                            <Carousel.Item key={name}>
                                <Main active={name === currentPane} />
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
            <ConfirmCloseDialog />
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
        const pane = getPersistedCurrentPane();
        if (pane) {
            dispatch(setCurrentPane(pane));
        }
    }, [dispatch]);
};

const useAllPanes = (
    panes: Pane[],
    documentation: ReactNode[] | undefined,
    feedbackCategories?: string[]
) => {
    const dispatch = useDispatch();

    const allPanes = useMemo(() => {
        const newPanes = [...panes];

        newPanes.push({
            name: AboutPaneName,
            Main: props => (
                <About
                    documentation={documentation}
                    feedbackCategories={feedbackCategories}
                    {...props}
                />
            ),
        });

        return newPanes;
    }, [panes, documentation, feedbackCategories]);

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
    createRoot(container).render(App);
};
