import { createContext, useCallback } from "react";
import toaster from 'toasted-notes' ;
import Toast from '../common/Toast';
import './NotificationProvider.scss';

const NotificationContext = createContext();

const TOAST_PROPS = {
  position: 'bottom',
  duration: 5000
};

const NotificationProvider = ({ children }) => {

  const showToast = useCallback(data => {
    toaster.notify(({ onClose }) => (
      <Toast {...data} closeToast={onClose} />
    ), TOAST_PROPS);
  }, []);

  return (
    <NotificationContext.Provider value={showToast}>
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationContext, NotificationProvider };