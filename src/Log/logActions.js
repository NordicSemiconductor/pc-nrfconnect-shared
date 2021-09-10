/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/**
 * Indicates that adding of log entries have been requested. This is dispatched
 * at regular intervals when some part of the application (core framework or app)
 * has used the winston logger instance to log something.
 *
 * @param {Array} entries Array of objects with id (number), time (Date), level
 * (number), message (string), and meta (object) properties.
 */
export const ADD_ENTRIES = 'LOG_ADD_ENTRIES';
export const addEntries = entries => ({ type: ADD_ENTRIES, entries });

/**
 * Indicates that clearing of all log entries in state has been requested.
 */
export const CLEAR_ENTRIES = 'LOG_CLEAR_ENTRIES';
export const clear = () => ({ type: CLEAR_ENTRIES });

/**
 * Indicates that toggling of auto scrolling in the LogViewer has been requested.
 */
export const TOGGLE_AUTOSCROLL = 'LOG_TOGGLE_AUTOSCROLL';
export const toggleAutoScroll = () => ({ type: TOGGLE_AUTOSCROLL });
