import React, { createContext, useCallback, useContext } from 'react';
import toaster from 'toasted-notes';
import Toast, { ToastProps } from '../common/Toast';
import './NotificationProvider.scss';
import { MessageOptionalOptions } from 'toasted-notes/lib/ToastManager';

export type NotificationContextValue = (data: ToastProps) => void;

const NotificationContext = createContext({} as NotificationContextValue);

const TOAST_PROPS: MessageOptionalOptions = {
  position: 'bottom',
  duration: 5000
};

const NotificationProvider = ({ children }: { children: React.ReactNode }) => {

  const showToast = useCallback((props: ToastProps) => {
    toaster.notify(({ onClose }) => (
      <Toast {...props} closeToast={onClose} />
    ), TOAST_PROPS);
  }, []);

  return (
    <NotificationContext.Provider value={showToast}>
      {children}
    </NotificationContext.Provider>
  );
};

const useToasts = () => useContext(NotificationContext);

export { useToasts, NotificationProvider };
