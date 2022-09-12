import { useCallback, useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import Button from "../common/Button";
import ScreenSwitcher from "../common/ScreenSwitcher";
import VolumeSlider from "../common/VolumeSlider";
import { useModals } from "../contexts/ModalStateProvider";
import { useScreens } from "../contexts/ScreenContextProvider";
import { eventPathHasNoSwipe } from "../utils/event";
import styles from './ActionPanel.module.scss';
import { SHUTDOWN_DIALOG, VOLUME_INDICATOR } from "./CommonModals";
import volumioIcon from "../assets/volumio-icon.png";
import ContextualModal from "../common/ContextualModal";
import { usePerformanceContext, useRawSettings } from "../contexts/SettingsProvider";

function ActionPanel(props) {
  const {settings} = useRawSettings('actionPanel');
  const {disableModal, enableModal, openModal} = useModals();
  const {disableTransitions} = usePerformanceContext();
  const {switchScreen} = useScreens();
  const overlayEl = useRef(null);
  const {closePanel} = props;

  const modalOverlayClassNames = {
    base: styles.Overlay,
    afterOpen: styles['Overlay--after-open'],
    beforeClose: styles['Overlay--before-close']
  };

  const modalClassNames = {
    base: `${styles.Layout} ${disableTransitions ? styles['Layout--solid'] : ''} no-swipe`,
    afterOpen: styles['Layout--after-open'],
    beforeClose: styles['Layout--before-close']
  }

  // Disable the Volume Indicator modal from showing
  // when Action Panel is opened
  useEffect(() => {
    if (props.isOpen) {
      disableModal(VOLUME_INDICATOR);
    }
    else {
      enableModal(VOLUME_INDICATOR);
    }
  }, [props.isOpen, disableModal, enableModal]);

  // Close when swipe up occurs on the overlay
  const swipeHandler = useSwipeable({
    onSwipedUp: (e) => {
      if (overlayEl.current && !eventPathHasNoSwipe(e.event, overlayEl.current)) {
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
  }, [switchScreen, closePanel]);

  const shutdown = useCallback(() => {
    openModal(SHUTDOWN_DIALOG);
  }, [openModal]);

  const extraButtonStyles = {
    baseClassName: 'ExtraButton',
    bundle: styles
  };

  const showVolumeSlider = settings.showVolumeSlider !== undefined ? settings.showVolumeSlider : true;
  
  return (
    <ContextualModal 
      closeTimeoutMS={200}
      overlayClassName={modalOverlayClassNames}
      className={modalClassNames}
      overlayRef={node => (overlayEl.current = node)}
      onAfterOpen={onModalOpened}
      {...props}>
      {showVolumeSlider ? <VolumeSlider /> : null}
      <div className={styles.Layout__row}>
        <ScreenSwitcher onSwitch={closePanel}/>
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
