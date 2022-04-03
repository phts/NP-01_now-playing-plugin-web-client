import styles from './NowPlayingScreen.module.scss';
import Dock from '../../common/Dock';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Button from '../../common/Button';
import { useModals } from '../../contexts/ModalStateProvider';
import classNames from 'classnames';
import { useSwipeable } from 'react-swipeable';
import { eventPathHasNoSwipe } from '../../utils/event';
import { useScreens } from '../../contexts/ScreenContextProvider';
import { ACTION_PANEL, VOLUME_INDICATOR } from '../../modals/CommonModals';
import PopupMenu from '../../common/PopupMenu';
import BasicView from './BasicView';
import InfoView from './InfoView';
import { useStore } from '../../contexts/StoreProvider';
import { useRawSettings } from '../../contexts/SettingsProvider';
import { usePlayerState } from '../../contexts/PlayerProvider';
import DockedVolumeIndicator from './DockedVolumeIndicator';

const RESTORE_STATE_KEY = 'NowPlayingScreen.restoreState';

function NowPlayingScreen(props) {
  const playerState = usePlayerState();
  const {openModal, disableModal, enableModal} = useModals();
  const {settings: screenSettings} = useRawSettings('screen.nowPlaying');
  const screenEl = useRef(null);
  const {activeScreenId, switchScreen} = useScreens();
  const store = useStore();
  const restoreState = store.get(RESTORE_STATE_KEY, {}, true);
  const [view, setView] = useState(restoreState.view || props.view || 'basic');

  // Update restoreState on view changed
  useEffect(() => {
    restoreState.view = view;
  }, [restoreState, view]);

  const openActionPanel = useCallback(() => {
    openModal(ACTION_PANEL);
  }, [openModal]);

  // Custom styles
  const css = useMemo(() => {
    const _css = {};
    if (screenSettings.fontSizes === 'custom') { 
      _css['--title-font-size'] = screenSettings.titleFontSize;
      _css['--artist-font-size'] = screenSettings.artistFontSize;
      _css['--album-font-size'] = screenSettings.albumFontSize;
      _css['--media-info-font-size'] = screenSettings.mediaInfoFontSize;
    }

    if (screenSettings.fontColors === 'custom') { 
      _css['--title-font-color'] = screenSettings.titleFontColor;
      _css['--artist-font-color'] = screenSettings.artistFontColor;
      _css['--album-font-color'] = screenSettings.albumFontColor;
      _css['--media-info-font-color'] = screenSettings.mediaInfoFontColor;
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

    if (screenSettings.widgetVisibility === 'custom') {
      if (!screenSettings.playbackButtonsVisibility) {
        _css['--playback-buttons-visibility'] = 'none';
        _css['--seekbar-margin'] = 'auto 0px 0px 0px';
      }
      if (!screenSettings.seekbarVisibility) {
        _css['--seekbar-visibility'] = 'none';
      }
    } 

    if (screenSettings.playbackButtonSizeType === 'custom') { 
      _css['--playback-buttons-size'] = screenSettings.playbackButtonSize;
    } 

    if (screenSettings.widgetMargins === 'custom') { 
      _css['--playback-buttons-margin'] = screenSettings.playbackButtonsMargin;
      _css['--seekbar-margin'] = screenSettings.seekbarMargin;
    }  

    if (screenSettings.albumartVisibility !== undefined && !screenSettings.albumartVisibility) {
      _css['--albumart-visibility'] = 'none';
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
  }, [screenSettings]);

  const getDockChildren = useCallback((position) => {
    const children = [];
    
    const dockedVolumeIndicator = screenSettings.dockedVolumeIndicator || {};
    if (dockedVolumeIndicator.enabled && dockedVolumeIndicator.placement === position) {
      const dockedVolumeIndicatorProps = {
        fontSize: dockedVolumeIndicator.fontSize,
        iconSize: dockedVolumeIndicator.iconSize,
        fontColor: dockedVolumeIndicator.fontColor,
        iconColor: dockedVolumeIndicator.iconColor,
        margin: dockedVolumeIndicator.margin
      };
      children.push(
        <DockedVolumeIndicator key="dockedVolumeIndicator" {...dockedVolumeIndicatorProps} />
      );
    }
    return children;
  }, [screenSettings]);

  const trackInfoOrder = useMemo(() => {
    const defaultTrackInfoOrder = [
      'title', 'artist', 'album', 'mediaInfo'
    ];
    if (screenSettings.trackInfoOrder === 'custom') {
      const customTrackOrder = [
        {key: 'title', order: !isNaN(screenSettings.trackInfoTitleOrder) ? screenSettings.trackInfoTitleOrder : -1},
        {key: 'artist', order: !isNaN(screenSettings.trackInfoArtistOrder) ? screenSettings.trackInfoArtistOrder : -1},
        {key: 'album', order: !isNaN(screenSettings.trackInfoAlbumOrder) ? screenSettings.trackInfoAlbumOrder : -1},
        {key: 'mediaInfo', order: !isNaN(screenSettings.trackInfoMediaInfoOrder) ? screenSettings.trackInfoMediaInfoOrder : -1}
      ];
      customTrackOrder.sort((a, b) => {
        const aOrder = (a.order !== -1) ? a.order : defaultTrackInfoOrder.indexOf(a.key);
        const bOrder = (b.order !== -1) ? b.order : defaultTrackInfoOrder.indexOf(b.key);
        if (aOrder === bOrder) {
          return (defaultTrackInfoOrder.indexOf(a.key) > defaultTrackInfoOrder.indexOf(b.key)) ? 1 : -1;
        }
        else {
          return (aOrder > bOrder) ? 1 : -1;
        }
      });
      return customTrackOrder.map( o => o.key );
    }
    else {
      return defaultTrackInfoOrder;
    }
  }, [screenSettings]);

  // Disable Volume Indicator modal when its docked
  // counterpart is displayed
  useEffect(() => {
    const viTweaks = screenSettings.volumeIndicator || {};
    if (viTweaks.visibility === 'always' && activeScreenId === 'NowPlaying') {
      disableModal(VOLUME_INDICATOR);
    }
    else {
      enableModal(VOLUME_INDICATOR);
    }
  }, [activeScreenId, screenSettings.volumeIndicator, disableModal, enableModal]);

  // Swipe handling
  const onScreenSwiped = useCallback((e) => {  
    if (screenEl.current === null || eventPathHasNoSwipe(e.event, screenEl.current)) {
      return;
    }
    const [startX, startY] = [...e.initial];
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
  }, [openActionPanel, switchScreen]);

  const swipeHandler = useSwipeable({
    onSwiped: onScreenSwiped
  });

  const swipeableRefPassthrough = (el) => {
    swipeHandler.ref(el);
    screenEl.current = el;
  };

  const handleMenuItemClicked = (e) => {
    e.syntheticEvent.stopPropagation();
    const {action} = e.value;
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
              type: 'currentPlaying',
              params: {
                type: action === 'gotoArtist' ? 'artist' : 'album',
                playerState
              }
            }
          }
        });
        break;
      default:
        return;
    }
  };

  // Menu
  const getMenu = () => {
    const menuItems = [
      {
        key: 'toggleView',
        value: {
          action: 'toggleView'
        },
        icon: view === 'basic' ? 'newspaper' : 'art_track',
        title: view === 'basic' ? 'Info View' : 'Basic View'
      },
      {
        type: 'divider',
        key: 'divider1',
      },
      {
        key: 'gotoArtist',
        value: {
          action: 'gotoArtist'
        },
        icon: 'person',
        title: 'Go to Artist'
      },
      {
        key: 'gotoAlbum',
        value: {
          action: 'gotoAlbum'
        },
        icon: 'album',
        title: 'Go to Album'
      }
    ];

    return (
      <PopupMenu
        styles={{
          baseClassName: 'PopupMenu',
          bundle: styles,
          extraClassNames: ['no-swipe']
        }}
        align="end"
        direction="bottom"
        onMenuItemClick={handleMenuItemClicked}
        menuItems={menuItems} />
    );
  }

  const layoutClasses = classNames([
    styles.Layout,
    props.className
  ]);

  return (
    <div 
      className={layoutClasses} 
      style={{...css, ...props.style}} 
      { ...swipeHandler } 
      ref={swipeableRefPassthrough}>
      <Dock position="topLeft">{ getDockChildren('top-left') }</Dock>
      <Dock position="top">
        <Button 
          styles={{
            baseClassName: 'ActionPanelTrigger',
            bundle: styles
          }} 
          onClick={ openActionPanel } 
          icon="expand_more" />
        { getDockChildren('top') }
      </Dock>
      <Dock position="topRight">
        { getDockChildren('top-right') }
        { getMenu() }
      </Dock>
      <Dock position="left">{ getDockChildren('left') }</Dock>
      <Dock position="right">{ getDockChildren('right') }</Dock>
      <Dock position="bottomLeft">{ getDockChildren('bottom-left') }</Dock>
      <Dock position="bottom">{ getDockChildren('bottom') }</Dock>
      <Dock position="bottomRight">{ getDockChildren('bottom-right') }</Dock>
      <div className={ styles.Layout__view }>
        {view === 'basic' ? 
          <BasicView playerState={playerState} trackInfoOrder={trackInfoOrder} />
          :
          <InfoView playerState={playerState} />}
      </div>
    </div>
  );
}

export default NowPlayingScreen;
