import React from 'react';
import './change-name.scss';


const ChangeName = () => {
    console.log('Hei');
    return (
        <div className="core20-rename">
            <input type="text" name="name" placeholder="Rename" />
        </div>
    );
};

export default ChangeName;
