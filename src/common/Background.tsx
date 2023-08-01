import React, { useCallback, useEffect, useRef, useReducer, Reducer, useState } from 'react';
import './Background.scss';
import './animations.scss';
import { sanitizeImageUrl } from '../utils/track';
import { useAppContext } from '../contexts/AppContextProvider';
import Image from './Image';
import { preloadImage } from '../utils/image';
import classNames from 'classnames';
import ContextualCSSTransition from './ContextualCSSTransition';
import { usePerformanceContext, useSettings } from '../contexts/SettingsProvider';
import { usePlayerState } from '../contexts/PlayerProvider';
import { CommonSettingsCategory } from 'now-playing-common';

export interface BackgroundProps {
  enteringScreenId: string | null;
  activeScreenId: string | null;
}

interface BackgroundTransitionState {
  targetSrc: string | null;
  loadedSrc: string | null;
  lastTargetSrc: string | null;
  lastLoadedSrc: string | null;
  phase?: 'idle' | 'preload' | 'beforeTransition' | 'transition' | 'afterTransition';
}

type BackgroundTransitionAction = Partial<BackgroundTransitionState>;

/**
   * Transition state phases:
   * 0. undefined - uninitialized state; for skipping first transition with empty albumart
   * 1. 'idle' - not doing anything
   * 2. 'preload' - preload background image
   * 3. 'beforeTransition' - prepare for transition
   * 3. 'transition' - transition to preloaded background image
   * 4. 'afterTransition' - transition completed
   *
   * For webkit browsers, we rely on background-image CSS transition. After 'preload', there is
   * no need to go through the 'beforeTransition' and 'transition' phases as they are for manual
   * cross-fade image transition in non-webkit browsers. Instead, we shall skip directly to the
   * 'afterTransition' phase.
   *
   */
const initialTransitionState: BackgroundTransitionState = {
  targetSrc: null,
  loadedSrc: null,
  lastTargetSrc: null,
  lastLoadedSrc: null,
  phase: undefined
};

function Background(props: BackgroundProps) {
  const { host, pluginInfo } = useAppContext();
  const { appUrl = null } = pluginInfo || {};
  const playerState = usePlayerState();
  const { settings: backgroundSettings } = useSettings(CommonSettingsCategory.Background);
  const fallbackSrc = `${host}/albumart`;
  const pendingTargetSrc = useRef<string | null>(null);
  const { disableTransitions } = usePerformanceContext();
  const [ targetSrc, setTargetSrc ] = useState<string | null>(null);
  const [ refreshTrigger, setRefreshTrigger ] = useState(Date.now());
  const currentPlayerStateRef = useRef(playerState);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const transitionStateReducer: Reducer<BackgroundTransitionState, BackgroundTransitionAction> = (state, transitionProps = {}) => {
    return { ...state, ...transitionProps };
  };

  const [ transitionState, updateTransitionState ] = useReducer(transitionStateReducer, initialTransitionState);

  const isWebkit = navigator.userAgent.indexOf('AppleWebKit') >= 0;
  const backgroundType = backgroundSettings.backgroundType;

  const isTransitionable = backgroundType === 'default' || backgroundType === 'albumart' ||
    (backgroundType === 'myBackground' && backgroundSettings.myBackgroundImageType === 'random');

  const refreshOnTrackChange = backgroundType === 'myBackground' &&
    backgroundSettings.myBackgroundImageType === 'random' &&
    backgroundSettings.myBackgroundRandomRefreshOnTrackChange;
  const refreshInterval = backgroundType === 'myBackground' &&
    backgroundSettings.myBackgroundImageType === 'random' ? backgroundSettings.myBackgroundRandomRefreshInterval : 0;

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearRefreshTimer();
    };
  }, [ clearRefreshTimer ]);

  // `transitionState` returns to 'idle' phase after transitioning to target image.
  // Start refresh timer if necessary.
  useEffect(() => {
    clearRefreshTimer();
    if (transitionState.phase !== 'idle') {
      return;
    }
    if (refreshInterval > 0) {
      refreshTimerRef.current = setTimeout(() => {
        setRefreshTrigger(Date.now());
      }, refreshInterval * 60 * 1000);
    }
    return () => {
      clearRefreshTimer();
    };
  }, [ clearRefreshTimer, transitionState, refreshInterval ]);

  // Background type: albumart - Refresh background when playerState.albumart changes
  useEffect(() => {
    if (backgroundType === 'default' || backgroundType === 'albumart') {
      const src = playerState.albumart ? sanitizeImageUrl(playerState.albumart, host) : fallbackSrc;
      setTargetSrc(src);
    }
  }, [ backgroundType, playerState.status, playerState.albumart, host, fallbackSrc ]);

  // Other background types - Refresh background when settings change or refresh forced (through `refreshTrigger`)
  useEffect(() => {
    let src: string | null | undefined;
    if (backgroundType === 'volumioBackground') {
      const volumioBackground = backgroundSettings.volumioBackgroundImage;
      src = volumioBackground ?
        sanitizeImageUrl(`/backgrounds/${backgroundSettings.volumioBackgroundImage}`, host) : fallbackSrc;
    }
    else if (backgroundType === 'myBackground') {
      if (appUrl) {
        src = `${appUrl}/mybg`;
        if (backgroundSettings.myBackgroundImageType === 'fixed' && backgroundSettings.myBackgroundImage) {
          src += `?file=${encodeURIComponent(backgroundSettings.myBackgroundImage)}`;
        }
        else {
          src += `?ts=${Date.now()}`;
        }
      }
    }
    else if (backgroundType === 'color') {
      src = null;
    }
    if (src !== undefined) {
      setTargetSrc(src);
    }
  }, [ refreshTrigger, backgroundType, host,
    backgroundSettings.volumioBackgroundImage, backgroundSettings.myBackgroundImageType,
    backgroundSettings.myBackgroundImage ]);

  // Background type: myBackground - Refresh background when playerState URI / title / album... changes (subject to myBackground settings)
  useEffect(() => {
    const oldState = currentPlayerStateRef.current;
    const trackChanged =
      playerState.uri !== oldState.uri ||
      playerState.title !== oldState.title ||
      playerState.artist !== oldState.artist ||
      playerState.album !== oldState.album;

    if (trackChanged && refreshOnTrackChange) {
      currentPlayerStateRef.current = { ...playerState };
      setRefreshTrigger(Date.now());
    }
  }, [ playerState.uri, playerState.title, playerState.artist, playerState.album, refreshOnTrackChange ]);

  // Update transition state when targetSrc changes
  useEffect(() => {
    if (!targetSrc && transitionState.phase !== undefined && transitionState.phase !== 'idle') {
      updateTransitionState({...initialTransitionState});
      return;
    }

    if ((transitionState.targetSrc === targetSrc ||
      transitionState.lastTargetSrc === targetSrc) &&
      pendingTargetSrc.current === targetSrc) {
      return;
    }
    // If background is still undergoing a transition, we set targetSrc as pending
    if (transitionState.phase !== undefined && transitionState.phase !== 'idle') {
      pendingTargetSrc.current = targetSrc;
    }
    else { // Otherwise start the transition phase
      pendingTargetSrc.current = null;
      // Begin 'preload' phase
      updateTransitionState({
        targetSrc,
        phase: 'preload'
      });
    }
  }, [ targetSrc, transitionState, updateTransitionState ]);

  const processPendingOrReset = useCallback(() => {
    if (pendingTargetSrc.current === null ||
      pendingTargetSrc.current === transitionState.targetSrc) {
      updateTransitionState({
        targetSrc: null,
        loadedSrc: null,
        phase: 'idle'
      });
    }
    else {
      updateTransitionState({
        targetSrc: pendingTargetSrc.current,
        loadedSrc: null,
        phase: 'preload'
      });
    }
  }, [ transitionState.targetSrc, updateTransitionState ]);

  // Handle 'preload' transition phase
  useEffect(() => {
    if (transitionState.phase !== 'preload') {
      return;
    }

    const onImageLoaded = function (src: string) {
      preloader.dispose();
      // For webkit browsers where we rely on background-image transition, or
      // Otherwise background is fixed, we skip straight to the 'afterTransition' phase.
      if (!isTransitionable || isWebkit) {
        updateTransitionState({
          lastTargetSrc: transitionState.targetSrc,
          lastLoadedSrc: src,
          phase: 'afterTransition'
        });
      }
      else { // Non-webkit browsers
        // On image preloaded, start the 'beforeTransition' phase
        updateTransitionState({
          loadedSrc: src,
          phase: 'beforeTransition'
        });
      }
    };
    const onImageError = function () {
      preloader.dispose();
      processPendingOrReset();
    };

    const preloader = preloadImage(transitionState.targetSrc, fallbackSrc, {
      'ready': onImageLoaded,
      'error': onImageError
    });

    return () => {
      preloader.dispose();
    };
  }, [ isTransitionable, isWebkit, transitionState, updateTransitionState, fallbackSrc, processPendingOrReset ]);

  // Handle 'beforeTransition' phase. At this time, the CSS transition would have been
  // Added to the DOM. We can then move on to the actual 'transition' phase.
  useEffect(() => {
    if (transitionState.phase !== 'beforeTransition') {
      return;
    }
    updateTransitionState({
      phase: 'transition'
    });
  }, [ transitionState, updateTransitionState ]);

  // Called when 'transition' phase completes. Move on to 'afterTransition' phase.
  const onTransitioned = useCallback(() => {
    if (transitionState.phase !== 'transition') {
      return;
    }
    updateTransitionState({
      lastTargetSrc: transitionState.targetSrc,
      lastLoadedSrc: transitionState.loadedSrc,
      phase: 'afterTransition'
    });
  }, [ updateTransitionState, transitionState ]);

  // Handle 'afterTransition' phase, in which we
  // Process pending albumart, or reset transition state if there is none pending.
  useEffect(() => {
    if (transitionState.phase !== 'afterTransition') {
      return;
    }

    // For webkit browsers, the background image is still in transition.
    // We wait for 1s (CSS transition time) before moving on.
    // For non-webkit browsers, the background image has fully transitioned
    // (i.e. 'transitioning' image shown), so we proceed immediately.
    if (isWebkit) {
      const transitionTimer = setTimeout(processPendingOrReset, 1000);

      return () => {
        clearTimeout(transitionTimer);
      };
    }
    // Non-webkit browsers
    processPendingOrReset();

  }, [ isWebkit, transitionState, updateTransitionState, processPendingOrReset ]);

  // Custom styles
  const css: any = {};
  if (backgroundType === 'albumart') {
    const albumartBackgroundFit = backgroundSettings.albumartBackgroundFit;
    const backgroundSize = albumartBackgroundFit === 'fill' ? '100% 100%' : albumartBackgroundFit;
    const backgroundPosition = backgroundSettings.albumartBackgroundPosition;
    const backgroundBlur = backgroundSettings.albumartBackgroundBlur || '0px';
    const backgroundScale = backgroundSettings.albumartBackgroundScale || '1';
    css['--background-size'] = backgroundSize;
    css['--background-position'] = backgroundPosition;
    css['--background-blur'] = backgroundBlur;
    css['--background-scale'] = backgroundScale;
  }
  else if (backgroundType === 'volumioBackground') {
    const volumioBackgroundFit = backgroundSettings.volumioBackgroundFit;
    const backgroundSize = volumioBackgroundFit === 'fill' ? '100% 100%' : volumioBackgroundFit;
    const backgroundPosition = backgroundSettings.volumioBackgroundPosition;
    const backgroundBlur = backgroundSettings.volumioBackgroundBlur || '0px';
    const backgroundScale = backgroundSettings.volumioBackgroundScale || '1';
    //Css['--background-image'] = `url("${host}/backgrounds/${backgroundSettings.volumioBackgroundImage}")`;
    css['--background-size'] = backgroundSize;
    css['--background-position'] = backgroundPosition;
    css['--background-blur'] = backgroundBlur;
    css['--background-scale'] = backgroundScale;
  }
  else if (backgroundType === 'myBackground') {
    const myBackgroundFit = backgroundSettings.myBackgroundFit;
    const backgroundSize = myBackgroundFit === 'fill' ? '100% 100%' : myBackgroundFit;
    const backgroundPosition = backgroundSettings.myBackgroundPosition;
    const backgroundBlur = backgroundSettings.myBackgroundBlur || '0px';
    const backgroundScale = backgroundSettings.myBackgroundScale || '1';
    css['--background-size'] = backgroundSize;
    css['--background-position'] = backgroundPosition;
    css['--background-blur'] = backgroundBlur;
    css['--background-scale'] = backgroundScale;
  }
  else if (backgroundType === 'color') {
    css['--background-image'] = 'none';
    css['--background-color'] = backgroundSettings.backgroundColor;
  }

  if (backgroundSettings.backgroundOverlay === 'customColor') {
    css['--background-overlay-color'] = backgroundSettings.backgroundOverlayColor;
    css['--background-overlay-opacity'] = backgroundSettings.backgroundOverlayColorOpacity;
  }
  else if (backgroundSettings.backgroundOverlay === 'customGradient') {
    css['--background-overlay-color'] = 'transparent';
    css['--background-overlay-gradient'] = backgroundSettings.backgroundOverlayGradient;
    css['--background-overlay-opacity'] = backgroundSettings.backgroundOverlayGradientOpacity || 1;
  }
  else if (backgroundSettings.backgroundOverlay === 'none') {
    css['--background-overlay-display'] = 'none';
  }

  //If (isTransitionable) {
  css['--default-background-image'] = transitionState.lastLoadedSrc ? `url("${transitionState.lastLoadedSrc}")` : 'none';
  //}

  if (props.enteringScreenId === 'Browse') {
    css['--active-screen-background-filter'] = 'var(--browse-screen-background-filter-entering)';
  }
  else if (props.activeScreenId === 'Browse') {
    css['--active-screen-background-filter'] = 'var(--browse-screen-background-filter)';
  }
  else if (props.enteringScreenId === 'Queue') {
    css['--active-screen-background-filter'] = 'var(--queue-screen-background-filter-entering)';
  }
  else if (props.activeScreenId === 'Queue') {
    css['--active-screen-background-filter'] = 'var(--queue-screen-background-filter)';
  }

  /*If (props.activeScreenId === 'Browse' || props.enteringScreenId === 'Browse') {
    css['--active-screen-background-filter'] = 'var(--browse-screen-background-filter)';
  }
  else if (props.activeScreenId === 'Queue' || props.enteringScreenId === 'Queue') {
    css['--active-screen-background-filter'] = 'var(--queue-screen-background-filter)';
  }*/

  return (
    <div
      className={classNames([ 'Background', isWebkit && !disableTransitions ? 'Background--webkit' : null ])}
      style={css}>
      {isTransitionable && !isWebkit && (transitionState.phase === 'beforeTransition' || transitionState.phase === 'transition') ?
        <ContextualCSSTransition
          in={transitionState.phase === 'transition'}
          classNames="bg-fadein"
          timeout={1000}
          onEntered={onTransitioned}>
          <Image
            src={transitionState.loadedSrc || ''}
            className="Background__transitioning"
          />
        </ContextualCSSTransition>
        : null}
    </div>
  );
}

export default Background;
