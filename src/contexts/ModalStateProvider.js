import { createContext, useCallback, useEffect, useRef, useState } from "react";

const ModalStateContext = createContext();

const ModalStateProvider = ({ children }) => {
  const [openedModals, setOpenedModals] = useState([]);
  const autoCloseTimers = useRef({});
  const disabledModals = useRef([]);

  const isModalOpened = useCallback(modal => {
    return openedModals.find(m => m.key === modal) ? true : false;
  }, [openedModals]);

  const closeModal = useCallback(modal => {
    if (isModalOpened(modal)) {
      setOpenedModals(openedModals.filter(m => m.key !== modal));
    }
  }, [isModalOpened, setOpenedModals, openedModals]);

  const isModalDisabled = useCallback(modal => {
    return disabledModals.current.includes(modal);
  }, []);

  const disableModal = useCallback(modal => {
    if (!isModalDisabled(modal)) {
      disabledModals.current.push(modal);
      if (isModalOpened(modal)) {
        closeModal(modal);
      }
    }
  }, [isModalDisabled, isModalOpened, closeModal]);

  const enableModal = useCallback(modal => {
    if (isModalDisabled(modal)) {
      disabledModals.current = disabledModals.current.filter(m => m !== modal);
    }
  }, [isModalDisabled]);

  const getModalData = useCallback(modal => {
    if (!isModalOpened(modal) || isModalDisabled(modal)) {
      return null;
    }
    return openedModals.find(m => m.key === modal).data;
  }, [isModalOpened, isModalDisabled, openedModals]);
  
  const startAutoCloseTimer = useCallback((modal, autoClose) => {
    const timers = autoCloseTimers.current;
    timers[modal] = setTimeout(() => {
      closeModal(modal);
      delete timers[modal];
    }, autoClose);
  }, [closeModal]);

  const clearAutoCloseTimer = (modal) => {
    const timers = autoCloseTimers.current;
    if (timers[modal]) {
      clearTimeout(timers[modal]);
      delete timers[modal];
      return true;
    }
    return false;
  };

  const openModal = useCallback((modal, options = {}) => {
    const opts = { autoClose: 0, data: null, ...options };
    if (!isModalDisabled(modal)) {
      if (!isModalOpened(modal)) {
        const _openedModals = [...openedModals, { ...opts, key: modal }];
        setOpenedModals(_openedModals);
      }
      else if (clearAutoCloseTimer(modal)) {
        setOpenedModals([...openedModals]);
      }
    }
  }, [isModalDisabled, isModalOpened, openedModals, setOpenedModals]);

  useEffect(() => {
    openedModals.forEach(m => {
      if (m.autoClose > 0) {
        startAutoCloseTimer(m.key, m.autoClose);
      }
    });
  }, [openedModals, startAutoCloseTimer]);

  return (
    <ModalStateContext.Provider 
      value={{ isModalOpened, openModal, closeModal, disableModal, enableModal, isModalDisabled, getModalData }}>
      {children}
    </ModalStateContext.Provider>
  );
};

export { ModalStateContext, ModalStateProvider };
