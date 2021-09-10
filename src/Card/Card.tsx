/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Card from 'react-bootstrap/Card';
import { element, oneOfType, string } from 'prop-types';

import styles from './card.module.scss';

type NrfCardProps = {
    title: React.ReactElement | string;
};

const NrfCard: React.FC<NrfCardProps> = ({ children, title }) => (
    <Card className={styles.card}>
        <Card.Header className={styles.header}>
            <Card.Title>
                <span className={styles.title}>{title}</span>
            </Card.Title>
        </Card.Header>
        <Card.Body className={styles.body}>{children}</Card.Body>
    </Card>
);

NrfCard.propTypes = {
    title: oneOfType([element, string]).isRequired,
};

export default NrfCard;
