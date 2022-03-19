import styles from './NowPlayingScreen.module.scss';
import Dock from '../../common/Dock';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { PlayerStateContext } from '../../contexts/PlayerStateProvider';
import Button from '../../common/Button';
import { ModalStateContext } from '../../contexts/ModalStateProvider';
import classNames from 'classnames';
import VolumeIndicator from '../../common/VolumeIndicator';
import { useSwipeable } from 'react-swipeable';
import { eventPathHasNoSwipe } from '../../utils/event';
import { ScreenContext } from '../../contexts/ScreenContextProvider';
import { ACTION_PANEL, VOLUME_INDICATOR } from '../../modals/CommonModals';
import PopupMenu from '../../common/PopupMenu';
import BasicView from './BasicView';
import InfoView from './InfoView';
import { StylesContext } from '../../contexts/StylesProvider';
import { ServiceContext } from '../../contexts/ServiceProvider';

function NowPlayingScreen(props) {
  const playerState = useContext(PlayerStateContext);
  const {browseService} = useContext(ServiceContext);
  const {openModal, disableModal, enableModal} = useContext(ModalStateContext);
  const {customStyles} = useContext(StylesContext);
  const screenEl = useRef(null);
  const {activeScreenId, switchScreen} = useContext(ScreenContext);
  const [view, setView] = useState('basic');

  const openActionPanel = useCallback(() => {
    openModal(ACTION_PANEL);
  }, [openModal]);

  // Custom styles
  const css = useMemo(() => {
    const _css = {};
    if (customStyles.fontSizes === 'custom') { 
      _css['--title-font-size'] = customStyles.titleFontSize;
      _css['--artist-font-size'] = customStyles.artistFontSize;
      _css['--album-font-size'] = customStyles.albumFontSize;
      _css['--media-info-font-size'] = customStyles.mediaInfoFontSize;
    }

    if (customStyles.fontColors === 'custom') { 
      _css['--title-font-color'] = customStyles.titleFontColor;
      _css['--artist-font-color'] = customStyles.artistFontColor;
      _css['--album-font-color'] = customStyles.albumFontColor;
      _css['--media-info-font-color'] = customStyles.mediaInfoFontColor;
    }

    if (customStyles.textAlignmentH) {
      _css['--text-alignment-h'] = customStyles.textAlignmentH;
    }

    if (customStyles.textAlignmentV) {
      _css['--text-alignment-v'] = customStyles.textAlignmentV;
    }

    if (customStyles.textAlignmentLyrics) {
      _css['--text-alignment-lyrics'] = customStyles.textAlignmentLyrics;
    }
  
    if (customStyles.textMargins === 'custom') { 
      _css['--title-margin'] = customStyles.titleMargin;
      _css['--artist-margin'] = customStyles.artistMargin;
      _css['--album-margin'] = customStyles.albumMargin;
      _css['--media-info-margin'] = customStyles.mediaInfoMargin;    
    }

    if (customStyles.maxLines === 'custom') {
      _css['--max-title-lines'] = customStyles.maxTitleLines;
      _css['--max-artist-lines'] = customStyles.maxArtistLines;
      _css['--max-album-lines'] = customStyles.maxAlbumLines;
    }

    if (customStyles.widgetColors === 'custom') { 
      _css['--widget-primary-color'] = customStyles.widgetPrimaryColor;
      _css['--widget-highlight-color'] = customStyles.widgetHighlightColor;
    } 

    if (customStyles.widgetVisibility === 'custom') {
      if (!customStyles.playbackButtonsVisibility) {
        _css['--playback-buttons-visibility'] = 'none';
        _css['--seekbar-margin'] = 'auto 0px 0px 0px';
      }
      if (!customStyles.seekbarVisibility) {
        _css['--seekbar-visibility'] = 'none';
      }
    } 

    if (customStyles.playbackButtonSizeType === 'custom') { 
      _css['--playback-buttons-size'] = customStyles.playbackButtonSize;
    } 

    if (customStyles.widgetMargins === 'custom') { 
      _css['--playback-buttons-margin'] = customStyles.playbackButtonsMargin;
      _css['--seekbar-margin'] = customStyles.seekbarMargin;
    }  

    if (customStyles.albumartVisibility !== undefined && !customStyles.albumartVisibility) {
      _css['--albumart-visibility'] = 'none';
    } 

    if (customStyles.albumartSize === 'custom') { 
      _css['--albumart-width'] = customStyles.albumartWidth;
      _css['--albumart-height'] = customStyles.albumartHeight;
    } 

    if (customStyles.albumartFit) { 
      _css['--albumart-fit'] = customStyles.albumartFit;
    } 

    if (customStyles.albumartBorderRadius) { 
      _css['--albumart-border-radius'] = customStyles.albumartBorderRadius;
    }
    
    return _css;
  }, [customStyles]);

  const getDockChildren = useCallback((position) => {
    const children = [];
    
    const viTweaks = customStyles.volumeIndicator || {};
    if (viTweaks.visibility === 'always') {
      const viPlacement = viTweaks.placement || 'bottom-right';
      if (viPlacement === position) {
        const viCSS = {};
        ['fontSize', 'margin'].forEach( prop => {
          if (viTweaks[prop]) {
            viCSS[prop] =  viTweaks[prop];
          }
        });
        children.push(<VolumeIndicator 
          key="VolumeIndicator"
          showDial={false}
          style={viCSS} />);
      }
    }
    return children;
  }, [customStyles])

  // Disable Volume Indicator modal when its docked
  // counterpart is displayed
  useEffect(() => {
    const viTweaks = customStyles.volumeIndicator || {};
    if (viTweaks.visibility === 'always' && activeScreenId === 'NowPlaying') {
      disableModal(VOLUME_INDICATOR);
    }
    else {
      enableModal(VOLUME_INDICATOR);
    }
  }, [activeScreenId, customStyles.volumeIndicator, disableModal, enableModal]);

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
        browseService.gotoCurrentPlaying(action === 'gotoArtist' ? 'artist' : 'album', playerState);
        switchScreen({
          screenId: 'Browse',
          enterTransition: 'slideLeft'
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
          <BasicView playerState={playerState} />
          :
          <InfoView playerState={playerState} />}
      </div>
    </div>
  );
}

export default NowPlayingScreen;
