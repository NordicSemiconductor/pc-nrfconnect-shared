import React  from 'react';
import './change-name.scss'


const ChangeName = ({}) => {
    

    return(
        <div className={'core20-rename'}>
            <form>
                <input type="text" name="name" placeholder= "Rename" />
            </form>
        </div>
    );
}

export default ChangeName;