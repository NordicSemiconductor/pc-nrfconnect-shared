/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import formatDate from 'date-fns/format';
import { type LogEntry } from 'winston';

import { openUrl } from '../utils/open';

import './log-entry.scss';

const regex = /(.*?)(https?:\/\/[^\s]+)/g;

/**
 * Convert strings to array of strings and JSX <a> tags for hrefs
 *
 * E.g. 'For reference see: https://github.com/example/doc.md or reboot Windows.'
 * will be converted to:
 * [
 *    'For reference see: ',
 *    <a href='https://github.com/example/doc.md'>https://github.com/example/doc.md</a>,
 *    ' or reboot Windows.',
 * ]
 *
 * @param {string} str input string
 * @returns {Array} strings and JSX <a> tags
 */
function hrefReplacer(str: string) {
    const message = [];
    const remainder = str.replace(regex, (_match, before, href, index) => {
        message.push(before);
        message.push(
            <a
                href={href}
                key={index}
                tabIndex={index}
                onClick={() => openUrl(href)}
                onKeyPress={() => {}}
            >
                {href}
            </a>,
        );
        return '';
    });
    message.push(remainder);
    return message;
}

export default ({ entry }: { entry: LogEntry }) => {
    const className = `core19-log-entry core19-log-level-${entry.level}`;
    const time = formatDate(new Date(entry.timestamp), 'HH:mm:ss.SSS');

    return (
        <div className={className}>
            <div className="core19-log-cell core19-log-time">{time}</div>
            <div className="core19-log-cell">{hrefReplacer(entry.message)}</div>
        </div>
    );
};
