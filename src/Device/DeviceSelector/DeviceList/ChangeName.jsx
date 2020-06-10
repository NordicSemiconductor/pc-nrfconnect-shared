import React from 'react';
import './change-name.scss';
import { func } from 'prop-types';

const ChangeName = props => {
    const handleChange = event => {
        props.onchange(event.target.value);
    };
    return (
        <div>
            <input
                placeholder="name"
                id="name"
                onChange={handleChange}
            />
        </div>
    );
};

ChangeName.propTypes = {
    onchange: func.isRequired,
};

export default ChangeName;
