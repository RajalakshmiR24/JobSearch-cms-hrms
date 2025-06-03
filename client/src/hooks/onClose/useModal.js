import { useCallback } from 'react';

const useModal = (onClose) => {
  const handleClose = useCallback(
    (e) => {
      e.preventDefault();
      console.log('Close button clicked');  // Debugging step
      if (onClose && typeof onClose === 'function') {
        onClose();
      }
    },
    [onClose]
  );

  return { handleClose };
};

export default useModal;
