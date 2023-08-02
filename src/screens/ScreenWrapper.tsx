import React, { useCallback, useEffect, useRef, useState } from 'react';
import ContextualCSSTransition from '../common/ContextualCSSTransition';
import { useAppContext } from '../contexts/AppContextProvider';
import { useModals } from '../contexts/ModalStateProvider';
import { usePlayerState } from '../contexts/PlayerProvider';
import { usePerformanceContext, useSettings } from '../contexts/SettingsProvider';
import { ACTION_PANEL } from '../modals/CommonModals';
import IdleScreen from './idle/IdleScreen';
import { IdleScreenBackgroundProvider } from './idle/IdleScreenBackgroundProvider';
import './ScreenWrapper.scss';
import { CommonSettingsCategory } from 'now-playing-common';

const ScreenWrapper = ({ children }: { children: React.ReactNode }) => {
  const playerState = usePlayerState();
  const { isModalOpened } = useModals();
  const { disableTransitions } = usePerformanceContext();
  const { settings: startupOptions } = useSettings(CommonSettingsCategory.Startup);
  const [ ignoreStartupOptions, setIgnoreStartupOptions ] = useState(false);
  const idleScreenWaitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [ idleScreenActive, setIdleScreenActive ] = useState(false);
  const { settings: idleScreenSettings } = useSettings(CommonSettingsCategory.IdleScreen);
  const { isKiosk } = useAppContext();
  const idleScreenWaitTime = idleScreenSettings.waitTime;
  const idleScreenEnabled = (() => {
    const enableValue = idleScreenSettings.enabled;
    switch (enableValue) {
      case 'kiosk':
        return isKiosk;
      case 'all':
        return true;
      default:
        return false;
    }
  })();

  /**
  * Idle View callbacks and effects
  */

  const enterIdleScreen = useCallback(() => {
    setIdleScreenActive(true);
  }, [ setIdleScreenActive ]);

  const exitIdleScreen = useCallback(() => {
    setIdleScreenActive(false);
  }, [ setIdleScreenActive ]);

  const startIdleScreenWaitTimer = useCallback(() => {
    idleScreenWaitTimerRef.current = setTimeout(enterIdleScreen, idleScreenWaitTime * 1000);
  }, [ enterIdleScreen, idleScreenWaitTime ]);

  const clearIdleScreenWaitTimer = useCallback(() => {
    if (idleScreenWaitTimerRef.current) {
      clearTimeout(idleScreenWaitTimerRef.current);
      idleScreenWaitTimerRef.current = null;
    }
  }, []);

  const restartIdleScreenWaitTimer = useCallback(() => {
    if (idleScreenWaitTimerRef.current) {
      clearIdleScreenWaitTimer();
      startIdleScreenWaitTimer();
    }
  }, [ clearIdleScreenWaitTimer, startIdleScreenWaitTimer ]);

  // Start Idle View timer when playerState changes to 'stop' or 'pause'
  const switchToIdleScreen = idleScreenEnabled && (playerState.status === 'stop' || playerState.status === 'pause');
  useEffect(() => {
    if (switchToIdleScreen && !idleScreenActive) {
      if (!ignoreStartupOptions && startupOptions.activateIdleScreen) {
        enterIdleScreen();
      }
      else {
        startIdleScreenWaitTimer();

        return () => {
          clearIdleScreenWaitTimer();
        };
      }
    }
    else if (!switchToIdleScreen && idleScreenActive) {
      exitIdleScreen();
    }
    if (!ignoreStartupOptions) {
      // Ignore startupOptions in future renders
      setIgnoreStartupOptions(true);
    }
  }, [ ignoreStartupOptions, startupOptions.activateIdleScreen, enterIdleScreen,
    switchToIdleScreen, idleScreenActive, startIdleScreenWaitTimer, clearIdleScreenWaitTimer, exitIdleScreen ]);

  useEffect(() => {
    setIgnoreStartupOptions(false);
  }, [ startupOptions ]);

  /** End Idle View callbacks and effects **/

  return (
    <ContextualCSSTransition
      in={isModalOpened(ACTION_PANEL)}
      classNames={!disableTransitions ? 'ScreenWrapper--blur' : 'ScreenWrapper--dim'}
      timeout={100}>
      <div
        className="ScreenWrapper"
        onMouseMove={restartIdleScreenWaitTimer}
        onClick={restartIdleScreenWaitTimer}
        onWheel={restartIdleScreenWaitTimer}
        onKeyDown={restartIdleScreenWaitTimer}
        onTouchStart={restartIdleScreenWaitTimer}
        onTouchEnd={restartIdleScreenWaitTimer}
        onTouchMove={restartIdleScreenWaitTimer}>
        {children}
        <IdleScreenBackgroundProvider>
          {idleScreenActive ? <IdleScreen onClick={exitIdleScreen} /> : null}
        </IdleScreenBackgroundProvider>
      </div>
    </ContextualCSSTransition>
  );
};

export default ScreenWrapper;
