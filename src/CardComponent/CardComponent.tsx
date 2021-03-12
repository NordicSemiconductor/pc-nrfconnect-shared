import React from 'react';
import { Card } from 'react-bootstrap';

import './card-component.scss';

const CardComponent = ({ title, body }: { title: string; body: string }) => {
    return (
        <Card className="card-layout">
            <Card.Header className="card-heading">
                <Card.Title>
                    <span className="title"> {title} </span>
                </Card.Title>
            </Card.Header>
            <Card.Body> {body} </Card.Body>
        </Card>
    );
};

export default CardComponent;
