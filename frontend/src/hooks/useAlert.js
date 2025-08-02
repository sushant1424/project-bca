import { useState } from 'react';

export const useAlert = () => {
  const [alert, setAlert] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    showConfirm: false,
    onConfirm: null
  });

  const showAlert = ({ type = 'info', title = 'Alert', message, showConfirm = false, onConfirm = null }) => {
    setAlert({
      isOpen: true,
      type,
      title,
      message,
      showConfirm,
      onConfirm
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  };

  return {
    alert,
    showAlert,
    hideAlert
  };
};

export default useAlert;
