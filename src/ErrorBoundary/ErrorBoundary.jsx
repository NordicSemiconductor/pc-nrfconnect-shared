import React from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

import { CollapsibleGroup } from '../SidePanel/Group';
import bugIcon from './bug.svg';

import './error-boundary.scss';

const { getCurrentWindow } = require('electron').remote;

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    componentDidCatch(error) {
        // You can also log the error to an error reporting service
        this.setState({
            hasError: true,
            error,
        });
    }

    render() {
        const { hasError, error } = this.state;
        const { children } = this.props;
        if (hasError) {
            return (
                <div className="error-boundary__container">
                    <div className="error-boundary__header">
                        <h1>Oops! There was a problem!</h1>
                        <img src={bugIcon} alt="" />
                    </div>
                    <div className="error-boundary__main">
                        {error !== null && (
                            <CollapsibleGroup heading="Show detailed error message">
                                <h2>{error.message}</h2>
                                <div>{error.stack}</div>
                            </CollapsibleGroup>
                        )}
                    </div>
                    <div className="error-boundary__footer">
                        <Button
                            variant="outline-primary"
                            onClick={() => {
                                getCurrentWindow().reload();
                            }}
                        >
                            Reload
                        </Button>
                        <Button
                            variant="outline-primary"
                            onClick={() => {
                                console.log('factory reset');
                            }}
                        >
                            Restore defaults
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                console.log('submitting report');
                            }}
                        >
                            Report issue
                        </Button>
                    </div>
                </div>
            );
        }

        return children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node,
};

export default ErrorBoundary;
