/// <reference types="../../declaration.d.ts" />

import { Scrollbars } from 'rc-scrollbars';
import md5 from 'md5';
import React, { HTMLProps, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSocket } from '../../contexts/SocketProvider';
import styles from './BrowseScreen.module.scss';
import Section, { BrowseScreenSectionProps } from './Section';
import 'font-awesome/css/font-awesome.min.css';
import FakeLoadingBar, { FakeLoadingBarElement } from './FakeLoadingBar';
import Toolbar, { BrowseScreenToolbarElement } from './Toolbar';
import { useModals } from '../../contexts/ModalStateProvider';
import Header, { BrowseScreenHeaderProps } from './Header';
import { useToasts } from '../../contexts/NotificationProvider';
import { ScreenProps, useScreens } from '../../contexts/ScreenContextProvider';
import classNames from 'classnames';
import { eventPathHasNoSwipe } from '../../utils/event';
import { SwipeEventData, useSwipeable } from 'react-swipeable';
import { ACTION_PANEL, ADD_TO_PLAYLIST_DIALOG, METADATA_MODAL, WEB_RADIO_DIALOG } from '../../modals/CommonModals';
import { useBrowseService, usePlaylistService, useQueueService } from '../../contexts/ServiceProvider';
import { getServiceByName, getServiceByUri, isPlayOnDirectClick } from './helper';
import { useStore } from '../../contexts/StoreProvider';
import { BrowseContentsList, BrowseContentsListItem, BrowseContentsPage, BrowseLocation, BrowseServiceContentsLoaderContext, BrowseServiceLocation, BrowseSource, BrowseSourceService } from '../../services/BrowseService';

export interface BrowseScreenProps extends ScreenProps {
  screenId: 'Browse';
  location?: BrowseServiceLocation;
  className?: string;
  style?: HTMLProps<HTMLDivElement>['style'];
}

interface BrowseScreenRestoreState {
  listView?: 'grid' | 'list';
  searchQuery?: string;
  scrollPosition?: number;
}

const HOME: BrowseLocation = {
  type: 'browse',
  uri: '',
  service: null
};

interface BrowseScreenContentsWithScroll extends BrowseContentsPage {
  __scroll?: number;
}

const RESTORE_STATE_KEY = 'BrowseScreen.restoreState';
const SCREEN_MAXIMIZED_KEY = 'screen.browse.maximized';

const isScreenMaximizable = () => window.innerWidth >= 1024;

function BrowseScreen(props: BrowseScreenProps) {
  const store = useStore();
  const persistentStore = useStore('persistent');
  const restoreState = store.get<BrowseScreenRestoreState>(RESTORE_STATE_KEY, {}, true);
  const {socket} = useSocket();
  const showToast = useToasts();
  const { openModal } = useModals();
  const playlistService = usePlaylistService();
  const queueService = useQueueService();
  const browseService = useBrowseService();
  const [ listView, setListView ] = useState(restoreState.listView || 'grid');
  const [ contents, setContents ] = useState<BrowseScreenContentsWithScroll>({});
  const currentLocation = useRef<BrowseServiceLocation>(HOME);
  const scrollbarsRef = useRef<Scrollbars | null>(null);
  const fakeLoadingBarRef = useRef<FakeLoadingBarElement>(null);
  const { switchScreen } = useScreens();
  const toolbarEl = useRef<BrowseScreenToolbarElement | null>(null);
  const screenRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const [ screenMaximizable, setScreenMaximizable ] = useState(isScreenMaximizable());
  const [ screenMaximized, maximizeScreen ] = useState(persistentStore.get(SCREEN_MAXIMIZED_KEY) || false);

  // Detect window resize for updating screenMaximizable

  useEffect(() => {
    const updateScreenMaximizable = () => {
      setScreenMaximizable(isScreenMaximizable());
    };

    window.addEventListener('resize', updateScreenMaximizable);

    return () => {
      window.removeEventListener('resize', updateScreenMaximizable);
    };
  }, []);

  // -- Save screenMaximized to localStorage when its value changes

  useEffect(() => {
    persistentStore.set(SCREEN_MAXIMIZED_KEY, screenMaximized);
  }, [ persistentStore, screenMaximized ]);

  // Browse / navigation handling

  useEffect(() => {
    const handleContentsLoading = () => {
      startFakeLoadingBar();
    };

    const handleContentsLoaded = (data: {contents: BrowseContentsPage, context: BrowseServiceContentsLoaderContext}) => {
      const {contents, context} = data;
      if (!context.isBack && !context.isRestore) {
        browseService.addCurrentToHistory(getScrollPosition());
      }
      currentLocation.current = context.location;
      setContents({...contents, __scroll: context.scrollPosition});
      stopFakeLoadingBar(true);
    };

    const handleContentsRefreshed = (data: {contents: BrowseContentsPage}) => {
      setContents({...data.contents, __scroll: getScrollPosition()});
    };

    const handleError = (data: { message: any }) => {
      showToast({
        type: 'error',
        message: data.message
      });
      stopFakeLoadingBar();
    };

    browseService.on('contentsLoading', handleContentsLoading);
    browseService.on('contentsLoaded', handleContentsLoaded);
    browseService.on('contentsRefreshed', handleContentsRefreshed);
    browseService.on('error', handleError);

    return () => {
      browseService.off('contentsLoading', handleContentsLoading);
      browseService.off('contentsLoaded', handleContentsLoaded);
      browseService.off('contentsRefreshed', handleContentsRefreshed);
      browseService.off('error', handleError);
    };
  }, [ setContents, browseService, showToast ]);

  // Update restoreState on change in listView
  useEffect(() => {
    restoreState.listView = listView;
  }, [ restoreState, listView ]);

  useEffect(() => {
    if (!props.location) {
      // Restore using scrollPosition from restoreState (which can be ignored
      // If browseService has been reset)
      browseService.restoreCurrentDisplayed(restoreState.scrollPosition || 0);
    }

    return (() => {
      // On unmount, save scrollPosition to restoreState
      restoreState.scrollPosition = scrollPositionRef.current;
    });
  }, [ browseService, restoreState, props.location ]);

  const getScrollPosition = () => {
    if (scrollbarsRef.current) {
      return scrollbarsRef.current.getScrollTop() || 0;
    }

    return 0;

  };

  scrollPositionRef.current = getScrollPosition();

  // Browse actions

  const browse = useCallback((location: BrowseLocation, refresh = false) => {
    browseService.browse(location, refresh);
  }, [ browseService ]);

  const search = useCallback((query: string, service?: BrowseSourceService | null) => {
    browseService.search(query, service);
  }, [ browseService ]);

  const goBack = useCallback(() => {
    browseService.goBack();
  }, [ browseService ]);

  // Handle props.location

  useEffect(() => {
    const location = props.location;
    if (!location) {
      return;
    }
    if (location.type === 'browse') {
      if (!location.uri) {
        browse(HOME);
      }
      else {
        const browseLocation: BrowseLocation = {
          type: 'browse',
          service: getServiceByUri(location.uri, browseService.getBrowseSources()),
          uri: location.uri
        };
        browse(browseLocation);
      }
    }
    else if (location.type === 'search') {
      const service = location.service?.name ?
        getServiceByName(location.service.name, browseService.getBrowseSources()) : null;
      search(location.query, service);
    }
    else if (location.type === 'goto') {
      const {type: currentPlayingType, playerState} = location.params;
      if (currentPlayingType && playerState) {
        browseService.gotoCurrentPlaying(currentPlayingType, playerState);
      }
    }
  }, [ props.location, browseService, browse, search ]);

  // Toolbar actions

  const toggleListView = useCallback(() => {
    setListView(listView === 'grid' ? 'list' : 'grid');
  }, [ setListView, listView ]);

  const onSearchQuery = useCallback((query: string, commit: boolean) => {
    restoreState.searchQuery = query; // Update restoreState
    if (commit) {
      search(query);
    }
  }, [ search, restoreState ]);

  const openActionPanel = useCallback(() => {
    openModal(ACTION_PANEL);
  }, [ openModal ]);

  const handleToolbarButtonClicked = useCallback((action: string) => {
    switch (action) {
      case 'home':
        browse(HOME);
        break;
      case 'back':
        goBack();
        break;
      case 'toggleListView':
        toggleListView();
        break;
      case 'toggleScreenMaximize':
        maximizeScreen(!screenMaximized);
        break;
      case 'openActionPanel':
        openActionPanel();
        break;
      case 'close':
        switchScreen({
          screenId: 'NowPlaying'
        });
        break;
      default:
    }
  }, [ browse, goBack, toggleListView, openActionPanel, switchScreen, screenMaximized ]);


  // Item actions

  const playItem = useCallback((item: BrowseContentsListItem | BrowseSource, list: BrowseContentsList, itemIndex: number) => {
    queueService.play(item, list, itemIndex);
  }, [ queueService ]);

  const getItemLocation = useCallback((item: BrowseContentsListItem | BrowseSource) => {
    if (!item.uri) {
      return null;
    }

    const intersectedData = item as BrowseContentsListItem & BrowseSource;
    let service: BrowseSourceService | null;
    if (!intersectedData.service && !intersectedData.plugin_name) {
      service = null;
    }
    else if (intersectedData.plugin_name) { // Item refers to a browse source
      service = {
        name: intersectedData.plugin_name,
        prettyName: intersectedData.plugin_name !== 'mpd' ? intersectedData.name : 'Music Library'
      };
    }
    else if (!currentLocation.current.service ||
      intersectedData.service !== currentLocation.current.service.name) {
      let prettyName: string;
      if (intersectedData.service === 'mpd') {
        prettyName = 'Music Library';
      }
      else {
        const itemService = browseService.getBrowseSources().find((source) => source.plugin_name === intersectedData.service);
        prettyName = itemService?.name || '';
      }
      service = {
        name: intersectedData.service,
        prettyName
      };
    }
    else {
      service = currentLocation.current.service;
    }
    const targetLocation: BrowseLocation = {
      type: 'browse',
      browseItem: item,
      uri: item.uri,
      service
    };
    return targetLocation;
  }, [ browseService ]);

  const handleItemClicked: BrowseScreenSectionProps['onItemClick'] = useCallback((item, list, itemIndex) => {
    if (!item.uri) {
      return;
    }

    const intersectedData = item as BrowseContentsListItem & BrowseSource;

    if (isPlayOnDirectClick(intersectedData.type)) {
      playItem(item, list, itemIndex);
    }
    else {
      const itemLocation = getItemLocation(item);
      if (itemLocation) {
        browse(itemLocation);
      }
    }
  }, [ playItem, browse, getItemLocation ]);

  const handlePlayClicked: BrowseScreenSectionProps['onPlayClick'] = useCallback((item, list, itemIndex) => {
    playItem(item, list, itemIndex);
  }, [ playItem ]);

  const callItemAction: BrowseScreenSectionProps['callItemAction'] = useCallback((item, list, itemIndex, action) => {
    let expectsContentsRefresh = false;
    if (action === 'play') {
      queueService.play(item, list, itemIndex);
    }
    else if (action === 'addToQueue') {
      queueService.addToQueue(item);
    }
    else if (action === 'addPlaylistToQueue') {
      queueService.addToQueue(item, true);
    }
    else if (action === 'clearAndPlay') {
      queueService.clearAndPlay(item);
    }
    else if (action === 'addToPlaylist') {
      openModal(ADD_TO_PLAYLIST_DIALOG, {
        data: {
          addType: 'item',
          item
        }
      });
    }
    else if (action === 'removeFromPlaylist') {
      if (currentLocation.current.type === 'browse' && currentLocation.current.browseItem?.title) {
        playlistService.removeFromPlaylist(item, currentLocation.current.browseItem.title);
        expectsContentsRefresh = true;
      }
    }
    else if (action === 'deletePlaylist' && item.title) {
      playlistService.deletePlaylist(item.title);
      expectsContentsRefresh = true;
    }
    else if (action === 'removeDrive' && item.title) {
      if (socket) {
        socket.emit('safeRemoveDrive', item.title);
        expectsContentsRefresh = true;
      }
    }
    else if (action === 'updateFolder') {
      if (socket) {
        socket.emit('updateDb', item.uri);
      }
    }
    else if (action === 'deleteFolder' && currentLocation.current.type === 'browse') {
      if (socket) {
        socket.emit('deleteFolder', { 'curUri': currentLocation.current.uri, 'item': item });
        expectsContentsRefresh = true;
      }
    }
    else if (action === 'addToFavorites') {
      playlistService.addToFavorites(item);
    }
    else if (action === 'removeFromFavorites') {
      playlistService.removeFromFavorites(item);
      expectsContentsRefresh = true;
    }
    else if (action === 'addWebRadio') {
      openModal(WEB_RADIO_DIALOG, { data: { mode: 'add' } });
    }
    else if (action === 'editWebRadio') {
      openModal(WEB_RADIO_DIALOG, {
        data: {
          mode: 'edit',
          name: item.title,
          url: item.uri
        }
      });
    }
    else if (action === 'deleteWebRadio') {
      playlistService.deleteWebRadio(item);
      expectsContentsRefresh = true;
    }
    else if (action === 'addWebRadioToFavorites') {
      playlistService.addWebRadioToFavorites(item);
    }
    else if (action === 'removeWebRadioFromFavorites') {
      playlistService.removeWebRadioFromFavorites(item);
      expectsContentsRefresh = true;
    }
    else if (action === 'viewInfo') {
      const modalData: any = {};
      if (item.type === 'song') {
        modalData.song = item.title;
        modalData.album = item.album;
        modalData.artist = item.artist;
      }
      else if (item.type === 'album') {
        modalData.album = item.title || item.album;
        modalData.artist = item.artist;
      }
      else if (item.type === 'artist') {
        modalData.artist = item.title;
      }
      else {
        modalData.album = item.album;
        modalData.artist = item.artist;
      }
      if (modalData.album || modalData.artist) {
        modalData.placeholderImage = item.albumart;
        openModal(METADATA_MODAL, { data: modalData });
      }
    }
    browseService.registerAction({
      action,
      expectsContentsRefresh,
      originatingLocation: currentLocation.current
    });
  }, [ queueService, playlistService, browseService, openModal, socket ]);

  const callHeaderItemAction: BrowseScreenHeaderProps['callItemAction'] = useCallback((item, action) => {
    callItemAction(item as any, {}, 0, action);
  }, [ callItemAction ]);


  // View components

  const sections = useMemo(() => {
    if (contents.navigation && Array.isArray(contents.navigation.lists)) {
      const keyPrefix = `${md5(JSON.stringify(currentLocation.current))}_section-`;
      const location = currentLocation.current;
      const sections = contents.navigation.lists.map((list, index) =>
        (
          <Section
            key={keyPrefix + index}
            list={list}
            location={location}
            preferredListView={listView}
            sectionIndex={index}
            onItemClick={handleItemClicked}
            onPlayClick={handlePlayClicked}
            callItemAction={callItemAction}
            maximized={screenMaximized} />
        )
      );
      return sections;
    }
    return null;
  }, [ contents.navigation, listView, handleItemClicked, handlePlayClicked, callItemAction, screenMaximized ]);

  const header = useMemo(() => {
    if (contents.navigation && contents.navigation.info) {
      return (
        <Header
          screenRef={screenRef}
          info={contents.navigation.info}
          callItemAction={callHeaderItemAction}
          screenMaximized={screenMaximized} />
      );
    }
    return null;
  }, [ contents.navigation, callHeaderItemAction, screenMaximized ]);

  useEffect(() => {
    if (scrollbarsRef.current) {
      scrollbarsRef.current.scrollTop(contents.__scroll || 0);
    }
  }, [ contents ]);


  // Swipe handling

  const onToolbarSwiped = useCallback((e: SwipeEventData) => {
    let nativeEvent: Event;
    if (e.event instanceof Event) {
      nativeEvent = e.event;
    }
    else {
      nativeEvent = e.event.nativeEvent;
    }
    if (toolbarEl.current === null || eventPathHasNoSwipe(nativeEvent, toolbarEl.current)) {
      return;
    }
    if (e.dir === 'Down') {
      openActionPanel();
    }
  }, [ openActionPanel ]);

  const toolbarSwipeHandler = useSwipeable({
    onSwiped: onToolbarSwiped
  });

  const toolbarRefPassthrough = (el: BrowseScreenToolbarElement) => {
    toolbarSwipeHandler.ref(el);
    toolbarEl.current = el;
  };


  // Fake loading bar

  const startFakeLoadingBar = () => {
    if (!fakeLoadingBarRef.current) {
      return;
    }
    fakeLoadingBarRef.current.start();
  };

  const stopFakeLoadingBar = (complete = false) => {
    if (!fakeLoadingBarRef.current) {
      return;
    }
    fakeLoadingBarRef.current.stop(complete);
  };

  const layoutClasses = classNames([
    styles.Layout,
    props.className
  ]);

  /*
  * Temporary workaround for my plugins that provide in-title links
  */
  useEffect(() => {
    const _angularBrowseFn = {
      fetchLibrary: (data: BrowseContentsListItem | BrowseSource) => {
        if (data.uri) {
          browse({
            type: 'browse',
            service: currentLocation.current.service,
            uri: data.uri
          });
        }
      },
      socketService: socket
    };
    const _angularBrowsePageEl = {
      scope: () => {
        return {
          browse: _angularBrowseFn
        };
      }
    };
    const angular = {
      element: (t: string) => {
        if (t === '#browse-page') {
          return _angularBrowsePageEl;
        }
      }
    };
    (window as any).angular = angular;
  }, [ browse, socket ]);

  return (
    <div
      ref={screenRef}
      className={layoutClasses}
      style={props.style}>
      <FakeLoadingBar ref={fakeLoadingBarRef} styles={styles} />
      <Toolbar
        ref={toolbarRefPassthrough}
        currentLocation={currentLocation.current}
        currentContents={contents}
        currentListView={listView}
        onButtonClick={handleToolbarButtonClicked}
        onSearchQuery={onSearchQuery}
        initialSearchQuery={restoreState.searchQuery || ''}
        screenMaximizable={screenMaximizable}
        screenMaximized={screenMaximized} />
      <Scrollbars
        ref={scrollbarsRef}
        className={styles.Layout__contents}
        classes={{
          thumbVertical: 'Scrollbar__handle'
        }}
        autoHide>
        {header}
        <div className={styles.Contents}>{sections}</div>
      </Scrollbars>
    </div>
  );
}

export default BrowseScreen;
