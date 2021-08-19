import { useEffect, useState } from 'react';

const useDetectClick = (element, initialState) => {
    const [isActive, setIsActive] = useState(initialState);

    useEffect(() => {
        const clickEvent = () => setIsActive(!isActive);

        if (isActive) {
            window.addEventListener('click', clickEvent);
        }

        return () => {
            window.removeEventListener('click', clickEvent);
        };
    }, [isActive, element]);

    return [isActive, setIsActive];
};

export default useDetectClick;
