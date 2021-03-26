import React from 'react';
import Card from 'react-bootstrap/Card';
import { element } from 'prop-types';

import './card-component.scss';

const CardComponent: React.FC<{
    title: React.ReactElement;
}> = ({ children, title }) => (
    <Card className="card-layout">
        <Card.Header className="card-heading">
            <Card.Title>
                <span className="title"> {title} </span>
            </Card.Title>
        </Card.Header>
        <Card.Body> {children} </Card.Body>
    </Card>
);

CardComponent.propTypes = {
    title: element.isRequired,
};

export default CardComponent;
