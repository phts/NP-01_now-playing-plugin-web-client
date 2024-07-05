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
import BasicView from './BasicView';
import InfoView from './InfoView';
import { useSettings } from '../../contexts/SettingsProvider';
import { useStore } from '../../contexts/StoreProvider';
import { usePlayerState } from '../../contexts/PlayerProvider';
import DockedVolumeIndicator from './DockedVolumeIndicator';
import DockedClock from './DockedClock';
import DockedWeather from './DockedWeather';
import DockedActionPanelTrigger from './DockedActionPanelTrigger';
import { TrackInfoTextProps } from '../../common/TrackInfoText';
import { CommonSettingsCategory, DockComponentPlacement } from 'now-playing-common';
import { StartupOptions } from 'now-playing-common/dist/config/StartupOptions';
import DockedMediaFormat from './DockedMediaFormat';
import DockedMenu from './DockedMenu';
import { LoadedFont, useFonts } from '../../contexts/FontProvider';

export interface NowPlayingScreenProps extends ScreenProps {
  screenId: 'NowPlaying';
  view?: 'basic' | 'info';
  style?: React.CSSProperties;
  className?: string;
}

interface NowPlayingScreenRestoreState {
  view?: NowPlayingScreenProps['view'];
  previouslyMounted?: boolean;
}

const getStartupView = (startupOptions: StartupOptions) => {
  if (startupOptions.activeScreen === 'nowPlaying.basicView') {
    return 'basic';
  }
  else if (startupOptions.activeScreen === 'nowPlaying.infoView') {
    return 'info';
  }
  return undefined;
};

const RESTORE_STATE_KEY = 'NowPlayingScreen.restoreState';

type FontFamily =
  'NowPlayingScreen_Title' |
  'NowPlayingScreen_Artist' |
  'NowPlayingScreen_Album' |
  'NowPlayingScreen_MediaInfo' |
  'NowPlayingScreen_SeekTime' |
  'NowPlayingScreen_Metadata';

function NowPlayingScreen(props: NowPlayingScreenProps) {
  const playerState = usePlayerState();
  const { openModal, disableModal, enableModal } = useModals();
  const { settings: contentRegionSettings } = useSettings(CommonSettingsCategory.ContentRegion);
  const { settings: screenSettings } = useSettings(CommonSettingsCategory.NowPlayingScreen);
  const { settings: startupOptions } = useSettings(CommonSettingsCategory.Startup);
  const { loadFont, getLoadedFonts } = useFonts();
  const [ loadedFonts, setLoadedFonts ] = useState<LoadedFont[]>([]);
  const screenEl = useRef<HTMLDivElement | null>(null);
  const { activeScreenId, switchScreen } = useScreens();
  const store = useStore();
  const restoreState = store.get<NowPlayingScreenRestoreState>(RESTORE_STATE_KEY, {}, true);
  const startupView = !restoreState.previouslyMounted ? getStartupView(startupOptions) : undefined;
  const [ view, setView ] = useState(startupView || restoreState.view || props.view || 'basic');

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

  useEffect(() => {
    const loadFontPromises = [
      loadFont('NowPlayingScreen_Title', screenSettings.titleFontStyle),
      loadFont('NowPlayingScreen_Artist', screenSettings.artistFontStyle),
      loadFont('NowPlayingScreen_Album', screenSettings.albumFontStyle),
      loadFont('NowPlayingScreen_MediaInfo', screenSettings.mediaInfoFontStyle),
      loadFont('NowPlayingScreen_SeekTime', screenSettings.seekTimeFontStyle),
      loadFont('NowPlayingScreen_Metadata', screenSettings.metadataFontStyle)
    ];
    Promise.all(loadFontPromises).then((results) => {
      // `loadFont()` returns true when document's fonts have actually changed
      if (!results.every((r) => !r)) {
        const families: FontFamily[] = [
          'NowPlayingScreen_Title',
          'NowPlayingScreen_Artist',
          'NowPlayingScreen_Album',
          'NowPlayingScreen_MediaInfo',
          'NowPlayingScreen_SeekTime',
          'NowPlayingScreen_Metadata'
        ];
        const loaded = getLoadedFonts().filter((f) => families.includes(f.family as any));
        setLoadedFonts(loaded);
      }
    })
      .catch((error) => {
        console.error(error);
      });
  }, [ loadFont, getLoadedFonts, screenSettings ]);

  const openActionPanel = useCallback(() => {
    openModal(ACTION_PANEL);
  }, [ openModal ]);

  // Custom styles
  const css = useMemo(() => {
    const _css: any = {};

    if (contentRegionSettings.padding === 'custom') {
      if (view === 'basic') {
        if (contentRegionSettings.npBasicViewPadding) {
          _css['--content-padding'] = contentRegionSettings.npBasicViewPadding;
        }
        if (contentRegionSettings.npBasicViewPaddingPortrait) {
          _css['--content-padding-portrait'] = contentRegionSettings.npBasicViewPaddingPortrait;
        }
      }
      else if (view === 'info') {
        if (contentRegionSettings.npInfoViewPadding) {
          _css['--content-padding'] = contentRegionSettings.npInfoViewPadding;
        }
        if (contentRegionSettings.npInfoViewPaddingPortrait) {
          _css['--content-padding-portrait'] = contentRegionSettings.npInfoViewPaddingPortrait;
        }
      }
    }

    if (screenSettings.fontStyles === 'custom') {
      if (loadedFonts.find((f) => f.family === 'NowPlayingScreen_Title')) {
        _css['--title-font-style'] = 'NowPlayingScreen_Title';
      }
      if (loadedFonts.find((f) => f.family === 'NowPlayingScreen_Artist')) {
        _css['--artist-font-style'] = 'NowPlayingScreen_Artist';
      }
      if (loadedFonts.find((f) => f.family === 'NowPlayingScreen_Album')) {
        _css['--album-font-style'] = 'NowPlayingScreen_Album';
      }
      if (loadedFonts.find((f) => f.family === 'NowPlayingScreen_MediaInfo')) {
        _css['--media-info-font-style'] = 'NowPlayingScreen_MediaInfo';
      }
      if (loadedFonts.find((f) => f.family === 'NowPlayingScreen_SeekTime')) {
        _css['--seek-time-font-style'] = 'NowPlayingScreen_SeekTime';
      }
      if (loadedFonts.find((f) => f.family === 'NowPlayingScreen_Metadata')) {
        _css['--metadata-font-style'] = 'NowPlayingScreen_Metadata';
      }
    }

    if (screenSettings.fontSizes === 'custom') {
      _css['--title-font-size'] = screenSettings.titleFontSize;
      _css['--artist-font-size'] = screenSettings.artistFontSize;
      _css['--album-font-size'] = screenSettings.albumFontSize;
      _css['--media-info-font-size'] = screenSettings.mediaInfoFontSize;
      _css['--seek-time-font-size'] = screenSettings.seekTimeFontSize;
      _css['--metadata-font-size'] = screenSettings.metadataFontSize;
      _css['--synced-lyrics-current-line-font-size'] = screenSettings.syncedLyricsCurrentLineFontSize;
    }

    if (screenSettings.fontColors === 'custom') {
      _css['--title-font-color'] = screenSettings.titleFontColor;
      _css['--artist-font-color'] = screenSettings.artistFontColor;
      _css['--album-font-color'] = screenSettings.albumFontColor;
      _css['--media-info-font-color'] = screenSettings.mediaInfoFontColor;
      _css['--seek-time-font-color'] = screenSettings.seekTimeFontColor;
      _css['--metadata-font-color'] = screenSettings.metadataFontColor;
      _css['--synced-lyrics-color'] = screenSettings.syncedLyricsColor;
      _css['--synced-lyrics-current-line-color'] = screenSettings.syncedLyricsCurrentLineColor;
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

    if (screenSettings.seekbarStyling === 'custom') {
      _css['--seekbar-height'] = screenSettings.seekbarThickness;
      _css['--seekbar-track-border-radius'] = screenSettings.seekbarBorderRadius;
      _css['--seekbar-thumb-size'] = screenSettings.seekbarThumbSize;
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

    if (screenSettings.albumartMargin) {
      _css['--albumart-margin'] = screenSettings.albumartMargin;
    }

    return _css;
  }, [ screenSettings, contentRegionSettings, view, loadedFonts ]);

  const getDockChildren = (position: DockComponentPlacement) => {
    const children: { order: number; component: React.JSX.Element; }[] = [];

    const dockedVolumeIndicator = screenSettings.dockedVolumeIndicator;
    if (dockedVolumeIndicator.enabled && dockedVolumeIndicator.placement === position) {
      children.push({
        order: Number(dockedVolumeIndicator.displayOrder) || 0,
        component: <DockedVolumeIndicator key="dockedVolumeIndicator" />
      });
    }

    const dockedClock = screenSettings.dockedClock;
    if (dockedClock.enabled && dockedClock.placement === position) {
      children.push({
        order: Number(dockedClock.displayOrder) || 0,
        component: <DockedClock key="dockedClock" />
      });
    }

    const dockedWeather = screenSettings.dockedWeather || {};
    if (dockedWeather.enabled && dockedWeather.placement === position) {
      children.push({
        order: Number(dockedWeather.displayOrder) || 0,
        component: <DockedWeather key="dockedWeather" />
      });
    }

    const dockedMediaFormat = screenSettings.dockedMediaFormat || {};
    if (dockedMediaFormat.enabled && dockedMediaFormat.placement === position) {
      children.push({
        order: Number(dockedMediaFormat.displayOrder) || 0,
        component: <DockedMediaFormat key="dockedMediaFormat" />
      });
    }

    const orderedChildren = children.sort((c1, c2) => (c1.order - c2.order)).map((c) => c.component);

    if (position === 'top') {
      const dockedActionPanelTrigger = screenSettings.dockedActionPanelTrigger;
      if (dockedActionPanelTrigger.enabled) {
        orderedChildren.unshift(
          <DockedActionPanelTrigger key="actionPanelTrigger" onClick={openActionPanel} />
        );
      }
    }

    if (position === 'top-right') {
      const dockedMenu = screenSettings.dockedMenu;
      if (dockedMenu.enabled) {
        orderedChildren.push(getMenu());
      }
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

  const seekbarProps = screenSettings.seekbarStyling === 'custom' ? {
    showThumb: screenSettings.seekbarShowThumb
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

  const handleMenuItemClicked = (action: string) => {
    switch (action) {
      case 'toggleView':
        setView(view === 'basic' ? 'info' : 'basic');
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
    return (
      <DockedMenu
        view={view}
        iconStyle={screenSettings.dockedMenu.iconStyle}
        onMenuItemClick={handleMenuItemClicked} />
    );
  };

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
            seekbarProps={seekbarProps}
            albumartVisibility={screenSettings.albumartVisibility}
            trackInfoOrder={trackInfoOrder}
            marqueeTitle={marqueeTitle} />
          : view === 'info' ?
            <InfoView
              playerState={playerState}
              widgetsVisibility={widgetsVisibility}
              seekbarProps={seekbarProps} />
            : null}
      </div>
    </div>
  );
}

export default NowPlayingScreen;
