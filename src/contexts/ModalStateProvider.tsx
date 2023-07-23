import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export interface ModalStateContextValue {
  isModalOpened: (key: string) => boolean;
  openModal: (key: string, options?: any) => void;
  closeModal: (key: string) => void;
  disableModal: (key: string) => void;
  enableModal: (key: string) => void;
  isModalDisabled: (key: string) => boolean;
  getModalData: (key: string) => any;
}

interface OpenedModal {
  key: string;
  data?: any;
  [k: string]: any; // Modal options
}

const ModalStateContext = createContext({} as ModalStateContextValue);

const ModalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [ openedModals, setOpenedModals ] = useState<OpenedModal[]>([]);
  const autoCloseTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const disabledModals = useRef<string[]>([]);
  const cachedModalData = useRef<Record<string, any>>({});

  const isModalOpened = useCallback((key: string) => {
    return !!openedModals.find((m) => m.key === key);
  }, [ openedModals ]);

  const closeModal = useCallback((key: string) => {
    if (isModalOpened(key)) {
      setOpenedModals(openedModals.filter((m) => m.key !== key));
    }
  }, [ isModalOpened, setOpenedModals, openedModals ]);

  const isModalDisabled = useCallback((key: string) => {
    return disabledModals.current.includes(key);
  }, []);

  const disableModal = useCallback((key: string) => {
    if (!isModalDisabled(key)) {
      disabledModals.current.push(key);
      if (isModalOpened(key)) {
        closeModal(key);
      }
    }
  }, [ isModalDisabled, isModalOpened, closeModal ]);

  const enableModal = useCallback((key: string) => {
    if (isModalDisabled(key)) {
      disabledModals.current = disabledModals.current.filter((m) => m !== key);
    }
  }, [ isModalDisabled ]);

  const getModalData = useCallback((key: string) => {
    if (!isModalOpened(key) || isModalDisabled(key)) {
      return cachedModalData.current[key] || null;
    }
    return openedModals.find((m) => m.key === key)?.data || null;
  }, [ isModalOpened, isModalDisabled, openedModals ]);

  const startAutoCloseTimer = useCallback((key: string, autoCloseMS: number) => {
    const timers = autoCloseTimers.current;
    timers[key] = setTimeout(() => {
      closeModal(key);
      delete timers[key];
    }, autoCloseMS);
  }, [ closeModal ]);

  const clearAutoCloseTimer = (key: string) => {
    const timers = autoCloseTimers.current;
    if (timers[key]) {
      clearTimeout(timers[key]);
      delete timers[key];
      return true;
    }
    return false;
  };

  const openModal = useCallback((key: string, options = {}) => {
    const opts = { autoClose: 0, data: null, ...options };
    if (!isModalDisabled(key)) {
      if (!isModalOpened(key)) {
        const _openedModals = [ ...openedModals, { ...opts, key } ];
        cachedModalData.current[key] = opts.data || null;
        setOpenedModals(_openedModals);
      }
      else if (clearAutoCloseTimer(key)) {
        setOpenedModals([ ...openedModals ]);
      }
    }
  }, [ isModalDisabled, isModalOpened, openedModals, setOpenedModals ]);

  useEffect(() => {
    openedModals.forEach((m) => {
      if (m.autoClose > 0) {
        startAutoCloseTimer(m.key, m.autoClose);
      }
    });
  }, [ openedModals, startAutoCloseTimer ]);

  return (
    <ModalStateContext.Provider
      value={{ isModalOpened, openModal, closeModal, disableModal, enableModal, isModalDisabled, getModalData }}>
      {children}
    </ModalStateContext.Provider>
  );
};

const useModals = () => useContext(ModalStateContext);

export { useModals, ModalStateProvider };
