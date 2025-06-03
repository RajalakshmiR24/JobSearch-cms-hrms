
import { useEffect } from 'react';

const KeyEventListener = () => {

    useEffect(() => {

        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {

                e.preventDefault();
            }
        };
        const handleContextMenu = (e) => {
            e.preventDefault();
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('contextmenu', handleContextMenu);


        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('contextmenu', handleContextMenu);
        };

    }, []);

    return null;
};

export default KeyEventListener;
