/// <reference types="../declaration.d.ts" />

import React, { useCallback, useEffect, useRef } from 'react';
import { SwipeEventData, useSwipeable } from 'react-swipeable';
import Button from '../common/Button';
import ScreenSwitcher from '../common/ScreenSwitcher';
import VolumeSlider from '../common/VolumeSlider';
import { useModals } from '../contexts/ModalStateProvider';
import { useScreens } from '../contexts/ScreenContextProvider';
import { eventPathHasNoSwipe } from '../utils/event';
import styles from './ActionPanel.module.scss';
import { SHUTDOWN_DIALOG, VOLUME_INDICATOR } from './CommonModals';
import volumioIcon from '../assets/volumio-icon.png';
import ContextualModal, { ContextualModalProps } from '../common/ContextualModal';
import { usePerformanceContext, useSettings } from '../contexts/SettingsProvider';
import { CommonSettingsCategory } from 'now-playing-common';

export interface ActionPanelProps extends ContextualModalProps {
  closePanel: () => void;
}

function ActionPanel(props: ActionPanelProps) {
  const { settings } = useSettings(CommonSettingsCategory.ActionPanel);
  const { disableModal, enableModal, openModal } = useModals();
  const { disableTransitions } = usePerformanceContext();
  const { switchScreen } = useScreens();
  const overlayEl = useRef<HTMLDivElement | null>(null);
  const { closePanel } = props;

  const modalOverlayClassNames = {
    base: styles.Overlay,
    afterOpen: styles['Overlay--after-open'],
    beforeClose: styles['Overlay--before-close']
  };

  const modalClassNames = {
    base: `${styles.Layout} ${disableTransitions ? styles['Layout--solid'] : ''} no-swipe`,
    afterOpen: styles['Layout--after-open'],
    beforeClose: styles['Layout--before-close']
  };

  // Disable the Volume Indicator modal from showing
  // When Action Panel is opened
  useEffect(() => {
    if (props.isOpen) {
      disableModal(VOLUME_INDICATOR);
    }
    else {
      enableModal(VOLUME_INDICATOR);
    }
  }, [ props.isOpen, disableModal, enableModal ]);

  // Close when swipe up occurs on the overlay
  const swipeHandler = useSwipeable({
    onSwipedUp: (e: SwipeEventData) => {
      let nativeEvent: Event;
      if (e.event instanceof Event) {
        nativeEvent = e.event;
      }
      else {
        nativeEvent = e.event.nativeEvent;
      }
      if (overlayEl.current && !eventPathHasNoSwipe(nativeEvent, overlayEl.current)) {
        closePanel();
      }
    }
  });

  const onModalOpened = () => {
    swipeHandler.ref(overlayEl.current);
  };

  // Handlers for extra buttons
  const refresh = useCallback(() => {
    window.location.reload();
  }, []);

  const switchToVolumio = useCallback(() => {
    switchScreen({
      screenId: 'Volumio'
    });
    closePanel();
  }, [ switchScreen, closePanel ]);

  const shutdown = useCallback(() => {
    openModal(SHUTDOWN_DIALOG);
  }, [ openModal ]);

  const extraButtonStyles = {
    baseClassName: 'ExtraButton',
    bundle: styles
  };

  return (
    <ContextualModal
      closeTimeoutMS={200}
      overlayClassName={modalOverlayClassNames}
      className={modalClassNames}
      overlayRef={(node) => (overlayEl.current = node)}
      onAfterOpen={onModalOpened}
      {...props}>
      {settings.showVolumeSlider ? <VolumeSlider /> : null}
      <div className={styles.Layout__row}>
        <ScreenSwitcher onSwitch={closePanel} />
        <div className={styles.Layout__extraButtonsWrapper}>
          <Button
            styles={extraButtonStyles}
            icon="refresh"
            onClick={refresh} />
          <Button
            styles={extraButtonStyles}
            image={volumioIcon}
            onClick={switchToVolumio} />
          <Button
            styles={extraButtonStyles}
            icon="power_settings_new"
            onClick={shutdown} />
        </div>
      </div>
    </ContextualModal>
  );
}

export default ActionPanel;
