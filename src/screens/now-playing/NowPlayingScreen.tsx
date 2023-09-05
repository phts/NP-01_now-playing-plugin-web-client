/// <reference types="../../declaration.d.ts" />

import styles from './NowPlayingScreen.module.scss';
import Dock from '../../common/Dock';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useModals } from '../../contexts/ModalStateProvider';
import classNames from 'classnames';
import { SwipeEventData, useSwipeable } from 'react-swipeable';
import { eventPathHasNoSwipe } from '../../utils/event';
import { ScreenProps, useScreens } from '../../contexts/ScreenContextProvider';
import { ACTION_PANEL, VOLUME_INDICATOR } from '../../modals/CommonModals';
import PopupMenu, { PopupMenuItem } from '../../common/PopupMenu';
import BasicView from './BasicView';
import InfoView from './InfoView';
import { useSettings } from '../../contexts/SettingsProvider';
import { useStore } from '../../contexts/StoreProvider';
import { usePlayerState } from '../../contexts/PlayerProvider';
import DockedVolumeIndicator from './DockedVolumeIndicator';
import DockedClock from './DockedClock';
import DockedWeather from './DockedWeather';
import DockedActionPanelTrigger from './DockedActionPanelTrigger';
import { useTranslation } from 'react-i18next';
import { ClickEvent } from '@szhsin/react-menu';
import { TrackInfoTextProps } from '../../common/TrackInfoText';
import { CommonSettingsCategory, DockComponentPlacement } from 'now-playing-common';
import { StartupOptions } from 'now-playing-common/dist/config/StartupOptions';
import VUMeterView from './VUMeterView';

export interface NowPlayingScreenProps extends ScreenProps {
  screenId: 'NowPlaying';
  view?: 'basic' | 'info' | 'vuMeter';
  style?: React.CSSProperties;
  className?: string;
}

interface NowPlayingScreenRestoreState {
  view?: NowPlayingScreenProps['view'];
  previouslyMounted?: boolean;
}

const getStartupView = (startupOptions: StartupOptions): NowPlayingScreenProps['view'] => {
  switch (startupOptions.activeScreen) {
    case 'nowPlaying.basicView':
      return 'basic';
    case 'nowPlaying.infoView':
      return 'info';
    case 'nowPlaying.vuMeter':
      return 'vuMeter';
    default:
      return undefined;
  }
};

const RESTORE_STATE_KEY = 'NowPlayingScreen.restoreState';

function NowPlayingScreen(props: NowPlayingScreenProps) {
  const playerState = usePlayerState();
  const { openModal, disableModal, enableModal } = useModals();
  const { settings: screenSettings } = useSettings(CommonSettingsCategory.NowPlayingScreen);
  const { settings: startupOptions } = useSettings(CommonSettingsCategory.Startup);
  const screenEl = useRef<HTMLDivElement | null>(null);
  const { activeScreenId, switchScreen } = useScreens();
  const store = useStore();
  const restoreState = store.get<NowPlayingScreenRestoreState>(RESTORE_STATE_KEY, {}, true);
  const startupView = !restoreState.previouslyMounted ? getStartupView(startupOptions) : undefined;
  const [ view, setView ] = useState(startupView || restoreState.view || props.view || 'basic');
  const { t } = useTranslation();

  useEffect(() => {
    return () => {
      restoreState.previouslyMounted = true;
    };
  }, []);

  /**
   * Comment from ScreenContextProvider:
   * Handle change in startupOptions. Note that the plugin does not broadcast changes in startupOptions
   * because they are applied only once when app starts and subsequent changes should not affect current state.
   * The situation where startupOptions can change is when apiPath changes causing SettingsProviderImpl to refetch
   * settings from API endpoint.
   */
  useEffect(() => {
    // Return if screen mounted before - use restoreState.view
    if (restoreState.previouslyMounted) {
      return;
    }
    const startupView = getStartupView(startupOptions);
    if (startupView) {
      setView(startupView);
    }
  }, [ startupOptions, restoreState ]);

  // Update restoreState on view changed
  useEffect(() => {
    restoreState.view = view;
  }, [ restoreState, view ]);

  const openActionPanel = useCallback(() => {
    openModal(ACTION_PANEL);
  }, [ openModal ]);

  // Custom styles
  const css = useMemo(() => {
    const _css: any = {};
    if (screenSettings.fontSizes === 'custom') {
      _css['--title-font-size'] = screenSettings.titleFontSize;
      _css['--artist-font-size'] = screenSettings.artistFontSize;
      _css['--album-font-size'] = screenSettings.albumFontSize;
      _css['--media-info-font-size'] = screenSettings.mediaInfoFontSize;
      _css['--seek-time-font-size'] = screenSettings.seekTimeFontSize;
      _css['--metadata-font-size'] = screenSettings.metadataFontSize;
    }

    if (screenSettings.fontColors === 'custom') {
      _css['--title-font-color'] = screenSettings.titleFontColor;
      _css['--artist-font-color'] = screenSettings.artistFontColor;
      _css['--album-font-color'] = screenSettings.albumFontColor;
      _css['--media-info-font-color'] = screenSettings.mediaInfoFontColor;
      _css['--seek-time-font-color'] = screenSettings.seekTimeFontColor;
      _css['--metadata-font-color'] = screenSettings.metadataFontColor;
    }

    if (screenSettings.textAlignmentH) {
      _css['--text-alignment-h'] = screenSettings.textAlignmentH;
    }

    if (screenSettings.textAlignmentV) {
      _css['--text-alignment-v'] = screenSettings.textAlignmentV;
    }

    if (screenSettings.textAlignmentLyrics) {
      _css['--text-alignment-lyrics'] = screenSettings.textAlignmentLyrics;
    }

    if (screenSettings.textMargins === 'custom') {
      _css['--title-margin'] = screenSettings.titleMargin;
      _css['--artist-margin'] = screenSettings.artistMargin;
      _css['--album-margin'] = screenSettings.albumMargin;
      _css['--media-info-margin'] = screenSettings.mediaInfoMargin;
    }

    if (screenSettings.maxLines === 'custom') {
      _css['--max-title-lines'] = screenSettings.maxTitleLines;
      _css['--max-artist-lines'] = screenSettings.maxArtistLines;
      _css['--max-album-lines'] = screenSettings.maxAlbumLines;
    }

    if (screenSettings.widgetColors === 'custom') {
      _css['--widget-primary-color'] = screenSettings.widgetPrimaryColor;
      _css['--widget-highlight-color'] = screenSettings.widgetHighlightColor;
    }

    if (screenSettings.playbackButtonSizeType === 'custom') {
      _css['--playback-buttons-size'] = screenSettings.playbackButtonSize;
    }

    if (screenSettings.widgetMargins === 'custom') {
      _css['--playback-buttons-margin'] = screenSettings.playbackButtonsMargin;
      _css['--seekbar-margin'] = screenSettings.seekbarMargin;
    }

    if (screenSettings.albumartSize === 'custom') {
      _css['--albumart-width'] = screenSettings.albumartWidth;
      _css['--albumart-height'] = screenSettings.albumartHeight;
    }

    if (screenSettings.albumartFit) {
      _css['--albumart-fit'] = screenSettings.albumartFit;
    }

    if (screenSettings.albumartBorder) {
      _css['--albumart-border'] = screenSettings.albumartBorder;
    }

    if (screenSettings.albumartBorderRadius) {
      _css['--albumart-border-radius'] = screenSettings.albumartBorderRadius;
    }

    return _css;
  }, [ screenSettings ]);

  const getDockChildren = (position: DockComponentPlacement) => {
    const children: { order: number; component: React.JSX.Element; }[] = [];
    const vuMeterViewActive = view === 'vuMeter';

    const isVisible = <T, >(component: T & { enabled: boolean; placement: DockComponentPlacement; showInVUMeterView: boolean}) =>
      component.enabled && component.placement === position && (!vuMeterViewActive || component.showInVUMeterView);

    const dockedVolumeIndicator = screenSettings.dockedVolumeIndicator;
    if (isVisible(dockedVolumeIndicator)) {
      children.push({
        order: Number(dockedVolumeIndicator.displayOrder) || 0,
        component: <DockedVolumeIndicator key="dockedVolumeIndicator" />
      });
    }

    const dockedClock = screenSettings.dockedClock;
    if (isVisible(dockedClock)) {
      children.push({
        order: Number(dockedClock.displayOrder) || 0,
        component: <DockedClock key="dockedClock" />
      });
    }

    const dockedWeather = screenSettings.dockedWeather || {};
    if (isVisible(dockedWeather)) {
      children.push({
        order: Number(dockedWeather.displayOrder) || 0,
        component: <DockedWeather key="dockedWeather" />
      });
    }

    const orderedChildren = children.sort((c1, c2) => (c1.order - c2.order)).map((c) => c.component);

    const dockedActionPanelTrigger = screenSettings.dockedActionPanelTrigger;
    if (isVisible({...dockedActionPanelTrigger, placement: 'top'})) {
      orderedChildren.unshift(
        <DockedActionPanelTrigger key="actionPanelTrigger" onClick={openActionPanel} />
      );
    }

    const dockedMenu = screenSettings.dockedMenu;
    if (isVisible({...dockedMenu, placement: 'top-right'})) {
      orderedChildren.push(getMenu());
    }

    return orderedChildren;
  };

  const trackInfoVisibility = screenSettings.trackInfoVisibility === 'custom' ? {
    title: screenSettings.titleVisibility,
    artist: screenSettings.artistVisibility,
    album: screenSettings.albumVisibility,
    mediaInfo: screenSettings.mediaInfoVisibility
  } : undefined;

  const widgetsVisibility = screenSettings.widgetVisibility === 'custom' ? {
    playbackButtons: screenSettings.playbackButtonsVisibility,
    seekbar: screenSettings.seekbarVisibility
  } : undefined;

  const trackInfoOrder = useMemo(() => {
    const defaultTrackInfoOrder = [
      'title', 'artist', 'album', 'mediaInfo'
    ];
    if (screenSettings.trackInfoOrder === 'custom') {
      const customTrackOrder = [
        { key: 'title', order: Number(screenSettings.trackInfoTitleOrder) || -1 },
        { key: 'artist', order: Number(screenSettings.trackInfoArtistOrder) || -1 },
        { key: 'album', order: Number(screenSettings.trackInfoAlbumOrder) || -1 },
        { key: 'mediaInfo', order: Number(screenSettings.trackInfoMediaInfoOrder) || -1 }
      ];
      customTrackOrder.sort((a, b) => {
        const aOrder = (a.order !== -1) ? a.order : defaultTrackInfoOrder.indexOf(a.key);
        const bOrder = (b.order !== -1) ? b.order : defaultTrackInfoOrder.indexOf(b.key);
        if (aOrder === bOrder) {
          return (defaultTrackInfoOrder.indexOf(a.key) > defaultTrackInfoOrder.indexOf(b.key)) ? 1 : -1;
        }

        return (aOrder > bOrder) ? 1 : -1;

      });
      return customTrackOrder.map((o) => o.key) as TrackInfoTextProps['trackInfoOrder'];
    }

    return defaultTrackInfoOrder as TrackInfoTextProps['trackInfoOrder'];

  }, [ screenSettings ]);

  // Disable Volume Indicator modal when its docked
  // Counterpart is displayed
  useEffect(() => {
    const dockedVolumeIndicator = screenSettings.dockedVolumeIndicator;
    if (dockedVolumeIndicator.enabled && activeScreenId === 'NowPlaying') {
      disableModal(VOLUME_INDICATOR);
    }
    else {
      enableModal(VOLUME_INDICATOR);
    }
  }, [ activeScreenId, screenSettings, disableModal, enableModal ]);

  // Swipe handling
  const onScreenSwiped = useCallback((e: SwipeEventData) => {
    let nativeEvent: Event;
    if (e.event instanceof Event) {
      nativeEvent = e.event;
    }
    else {
      nativeEvent = e.event.nativeEvent;
    }
    if (screenEl.current === null || eventPathHasNoSwipe(nativeEvent, screenEl.current)) {
      return;
    }
    const [ startX, startY ] = [ ...e.initial ];
    const w = screenEl.current.offsetWidth;
    const h = screenEl.current.offsetHeight;
    if (e.dir === 'Down' && startY < h * 0.5) {
      openActionPanel();
    }
    else if ((e.dir === 'Right' && startX < w * 0.5) ||
      (e.dir === 'Left' && startX > (w * 0.5))) {
      switchScreen({
        screenId: 'Browse',
        enterTransition: `slide${e.dir}`
      });
    }
    else if (e.dir === 'Up' && startY > (h * 0.5)) {
      switchScreen({
        screenId: 'Queue',
        enterTransition: `slide${e.dir}`
      });
    }
  }, [ openActionPanel, switchScreen ]);

  const swipeHandler = useSwipeable({
    onSwiped: onScreenSwiped
  });

  const swipeableRefPassthrough = (el: HTMLDivElement) => {
    swipeHandler.ref(el);
    screenEl.current = el;
  };

  const handleMenuItemClicked = (e: ClickEvent) => {
    e.syntheticEvent.stopPropagation();
    const { action } = e.value;
    switch (action) {
      case 'setBasicView':
        if (view !== 'basic') {
          setView('basic');
        }
        break;
      case 'setInfoView':
        if (view !== 'info') {
          setView('info');
        }
        break;
      case 'setVUMeterView':
        if (view !== 'vuMeter') {
          setView('vuMeter');
        }
        break;
      case 'gotoArtist':
      case 'gotoAlbum':
        switchScreen({
          screenId: 'Browse',
          enterTransition: 'slideLeft',
          screenProps: {
            location: {
              type: 'goto',
              params: {
                type: action === 'gotoArtist' ? 'artist' : 'album',
                playerState
              }
            }
          }
        });
        break;
      default:

    }
  };

  // Menu
  const getMenu = () => {
    const menuItems: PopupMenuItem[] = [
      {
        type: 'item',
        key: 'setBasicView',
        value: {
          action: 'setBasicView'
        },
        icon: 'art_track',
        title: t('screen.nowPlaying.basicView'),
        selected: view === 'basic'
      },
      {
        type: 'item',
        key: 'setInfoView',
        value: {
          action: 'setInfoView'
        },
        icon: 'newspaper',
        title: t('screen.nowPlaying.infoView'),
        selected: view === 'info'
      },
      {
        type: 'item',
        key: 'setVUMeterView',
        value: {
          action: 'setVUMeterView'
        },
        icon: 'speed',
        title: t('screen.nowPlaying.vuMeterView'),
        selected: view === 'vuMeter'
      },
      {
        type: 'divider',
        key: 'divider1'
      },
      {
        type: 'item',
        key: 'gotoArtist',
        value: {
          action: 'gotoArtist'
        },
        icon: 'person',
        title: t('action.gotoArtist')
      },
      {
        type: 'item',
        key: 'gotoAlbum',
        value: {
          action: 'gotoAlbum'
        },
        icon: 'album',
        title: t('action.gotoAlbum')
      }
    ];

    return (
      <PopupMenu
        styles={{
          baseClassName: 'PopupMenu',
          bundle: styles,
          extraClassNames: [ 'no-swipe' ]
        }}
        key="nowPlayingPopupMenu"
        align="end"
        direction="bottom"
        onMenuItemClick={handleMenuItemClicked}
        menuItems={menuItems} />
    );
  };

  const { vuMeter: vuMeterSettings } = screenSettings;
  const vuMeterViewComponent = useMemo(() => {
    if (view !== 'vuMeter') {
      return null;
    }
    return <VUMeterView {...vuMeterSettings} />;

  }, [ view, vuMeterSettings.templateType, vuMeterSettings.template, vuMeterSettings.meterType,
    vuMeterSettings.meter, vuMeterSettings.randomRefreshInterval, vuMeterSettings.randomRefreshOnTrackChange ]);

  const layoutClasses = classNames([
    styles.Layout,
    props.className
  ]);

  const marqueeTitle = screenSettings.trackInfoMarqueeTitle;

  return (
    <div
      className={layoutClasses}
      style={{ ...css, ...props.style }}
      {...swipeHandler}
      ref={swipeableRefPassthrough}>
      <Dock position="topLeft">{getDockChildren('top-left')}</Dock>
      <Dock position="top">{getDockChildren('top')}</Dock>
      <Dock position="topRight">{getDockChildren('top-right')}</Dock>
      <Dock position="left">{getDockChildren('left')}</Dock>
      <Dock position="right">{getDockChildren('right')}</Dock>
      <Dock position="bottomLeft">{getDockChildren('bottom-left')}</Dock>
      <Dock position="bottom">{getDockChildren('bottom')}</Dock>
      <Dock position="bottomRight">{getDockChildren('bottom-right')}</Dock>
      <div className={styles.Layout__view}>
        {view === 'basic' ?
          <BasicView
            playerState={playerState}
            trackInfoVisibility={trackInfoVisibility}
            widgetsVisibility={widgetsVisibility}
            albumartVisibility={screenSettings.albumartVisibility}
            trackInfoOrder={trackInfoOrder}
            marqueeTitle={marqueeTitle} />
          : view === 'info' ?
            <InfoView playerState={playerState} />
            : view === 'vuMeter' ?
              vuMeterViewComponent
              : null}
      </div>
    </div>
  );
}

export default NowPlayingScreen;
