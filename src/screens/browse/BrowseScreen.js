import { Scrollbars } from 'rc-scrollbars';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSocket } from '../../contexts/SocketProvider';
import styles from './BrowseScreen.module.scss';
import Section from './Section';
import 'font-awesome/css/font-awesome.min.css';
import FakeLoadingBar from './FakeLoadingBar';
import Toolbar from './Toolbar';
import { useModals } from '../../contexts/ModalStateProvider';
import Header from './Header';
import { useToasts } from '../../contexts/NotificationProvider';
import { useScreens } from '../../contexts/ScreenContextProvider';
import classNames from 'classnames';
import { eventPathHasNoSwipe } from '../../utils/event';
import { useSwipeable } from 'react-swipeable';
import { ACTION_PANEL, ADD_TO_PLAYLIST_DIALOG, METADATA_MODAL, WEB_RADIO_DIALOG } from '../../modals/CommonModals';
import { useBrowseService, usePlaylistService, useQueueService } from '../../contexts/ServiceProvider';
import { getServiceByName, getServiceByUri, isPlayOnDirectClick } from './helper';
import { useStore } from '../../contexts/StoreProvider';

const HOME = {
  type: 'browse',
  uri: '',
  service: null
};

const RESTORE_STATE_KEY = 'BrowseScreen.restoreState';

function BrowseScreen(props) {
  const store = useStore();
  const restoreState = store.get(RESTORE_STATE_KEY, {}, true);
  const {socket} = useSocket();
  const showToast = useToasts();
  const { openModal } = useModals();
  const playlistService = usePlaylistService();
  const queueService = useQueueService();
  const browseService = useBrowseService();
  const [listView, setListView] = useState(restoreState.listView || 'grid');
  const [contents, setContents] = useState({});
  const currentLocation = useRef(HOME);
  const scrollbarsRef = useRef(null);
  const fakeLoadingBarRef = useRef(null);
  const { switchScreen } = useScreens();
  const toolbarEl = useRef(null);
  const screenRef = useRef(null);
  const scrollPositionRef = useRef(0);

  // Browse / navigation handling

  useEffect(() => {
    const handleContentsLoading = () => {
      startFakeLoadingBar();
    };

    const handleContentsLoaded = (data) => {
      if (!data.isBack && !data.isRestore) {
        browseService.addCurrentToHistory(getScrollPosition());
      }
      currentLocation.current = data.location;
      setContents({...data.contents, __scroll: data.scrollPosition});
      stopFakeLoadingBar(true);
    };

    const handleContentsRefreshed = (data) => {
      setContents({...data.contents, __scroll: getScrollPosition()});
    };

    const handleError = (data) => {
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
    }
  }, [setContents, browseService, showToast]);

  // Update restoreState on change in listView
  useEffect(() => {
    restoreState.listView = listView;
  }, [restoreState, listView]);

  useEffect(() => {
    if (!props.location) {
      // Restore using scrollPosition from restoreState (which can be ignored
      // if browseService has been reset)
      browseService.restoreCurrentDisplayed(restoreState.scrollPosition);
    }

    return (() => {
      // On unmount, save scrollPosition to restoreState
      restoreState.scrollPosition = scrollPositionRef.current;
    });
  }, [browseService, restoreState, props.location]);

  const getScrollPosition = () => {
    if (scrollbarsRef.current) {
      return scrollbarsRef.current.getScrollTop() || 0;
    }
    else {
      return 0;
    }
  };

  scrollPositionRef.current = getScrollPosition();

  // Browse actions

  const browse = useCallback((location, refresh = false) => {
    browseService.browse(location, refresh);
  }, [browseService]);

  const search = useCallback((query, service) => {
    browseService.search(query, service);
  }, [browseService]);

  const goBack = useCallback(() => {
    browseService.goBack();
  }, [browseService]);

  // Handle props.location

  useEffect(() => {
    if (!props.location) {
      return;
    }
    const {type, params} = props.location;
    if (type === 'browse') {
      const {uri} = params;
      if (!uri) {
        browse(HOME);
      }
      else {
        const browseLocation = {
          type: 'browse',
          service: getServiceByUri(uri, browseService.getBrowseSources()),
          uri
        };
        browse(browseLocation);
      }
    }
    else if (type === 'search') {
      const {query, service: serviceName} = params;
      const service = getServiceByName(serviceName, browseService.getBrowseSources());
      search(query, service);
    }
    else if (type === 'currentPlaying') {
      const {type: currentPlayingType, playerState} = params;
      if (currentPlayingType && playerState) {
        browseService.gotoCurrentPlaying(currentPlayingType, playerState);
      }
    }
  }, [props.location, browseService, browse, search]);

  // Toolbar actions

  const toggleListView = useCallback(() => {
    setListView(listView === 'grid' ? 'list' : 'grid');
  }, [setListView, listView]);

  const onSearchQuery = useCallback((query, commit) => {
    restoreState.searchQuery = query; // Update restoreState
    if (commit) {
      search(query);
    }
  }, [search, restoreState]);

  const openActionPanel = useCallback(() => {
    openModal(ACTION_PANEL);
  }, [openModal]);

  const handleToolbarButtonClicked = useCallback((action) => {
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
  }, [browse, goBack, toggleListView, openActionPanel, switchScreen]);


  // Item actions

  const playItem = useCallback((item, list, itemIndex) => {
    queueService.play(item, list, itemIndex);
  }, [queueService]);

  const getItemLocation = useCallback((item) => {
    const targetLocation = {
      type: 'browse',
      browseItem: item,
      uri: item.uri
    }
    if (!item.service && !item.plugin_name) {
      targetLocation.service = null;
    }
    else if (item.plugin_name) { // item refers to a browse source
      targetLocation.service = {
        name: item.plugin_name,
        prettyName: item.plugin_name !== 'mpd' ? item.name : 'Music Library'
      };
    }
    else if (currentLocation.current.service === null ||
      item.service !== currentLocation.current.service.name) {
      let prettyName;
      if (item.service === 'mpd') {
        prettyName = 'Music Library';
      }
      else {
        const itemService = browseService.getBrowseSources().find(source => source.plugin_name === item.service);
        prettyName = itemService ? itemService.name : '';
      }
      targetLocation.service = {
        name: item.service,
        prettyName
      };
    }
    else {
      targetLocation.service = currentLocation.current.service;
    }
    return targetLocation;
  }, [browseService]);

  const handleItemClicked = useCallback((item, list, itemIndex) => {
    if (!item.uri) {
      return;
    }

    if (isPlayOnDirectClick(item.type)) {
      playItem(item, list, itemIndex);
    }
    else {
      browse(getItemLocation(item));
    }
  }, [playItem, browse, getItemLocation]);

  const handlePlayClicked = useCallback((item, list, itemIndex) => {
    playItem(item, list, itemIndex);
  }, [playItem]);

  const callItemAction = useCallback((item, list, itemIndex, action) => {
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
      playlistService.removeFromPlaylist(item, currentLocation.current.browseItem.title);
      expectsContentsRefresh = true;
    }
    else if (action === 'deletePlaylist') {
      playlistService.deletePlaylist(item.title);
      expectsContentsRefresh = true;
    }
    else if (action === 'removeDrive') {
      socket.emit('safeRemoveDrive', item.title);
      expectsContentsRefresh = true;
    }
    else if (action === 'updateFolder') {
      socket.emit('updateDb', item.uri);
    }
    else if (action === 'deleteFolder') {
      socket.emit('deleteFolder', { 'curUri': currentLocation.current.uri, 'item': item });
      expectsContentsRefresh = true;
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
      const modalData = {};
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
  }, [queueService, playlistService, browseService, openModal, socket]);


  // View components

  const sections = useMemo(() => {
    if (contents.navigation && Array.isArray(contents.navigation.lists)) {
      const keyPrefix = currentLocation.current.uri + '_section-';
      const sections = contents.navigation.lists.map((list, index) =>
      (
        <Section
          key={keyPrefix + index}
          list={list}
          location={currentLocation.current}
          preferredListView={listView}
          sectionIndex={index}
          onItemClick={handleItemClicked}
          onPlayClick={handlePlayClicked}
          callItemAction={callItemAction} />
      )
      );
      return sections;
    }
    return null;
  }, [contents.navigation, listView, handleItemClicked, handlePlayClicked, callItemAction]);

  const header = useMemo(() => {
    if (contents.navigation && contents.navigation.info) {
      return (
        <Header 
          screenRef={screenRef}
          info={contents.navigation.info} 
          callItemAction={callItemAction} />
      );
    }
    return null;
  }, [contents.navigation, callItemAction]);

  useEffect(() => {
    if (scrollbarsRef.current) {
      scrollbarsRef.current.scrollTop(contents.__scroll || 0);
    }
  }, [contents]);


  // Swipe handling

  const onToolbarSwiped = useCallback((e) => {
    if (toolbarEl.current === null || eventPathHasNoSwipe(e.event, toolbarEl.current)) {
      return;
    }
    if (e.dir === 'Down') {
      openActionPanel();
    }
  }, [openActionPanel]);

  const toolbarSwipeHandler = useSwipeable({
    onSwiped: onToolbarSwiped
  });

  const toolbarRefPassthrough = (el) => {
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
      fetchLibrary: (data) => {
        browse({
          type: 'browse',
          service: currentLocation.current.service,
          uri: data.uri
        });
      },
      socketService: socket
    };
    const _angularBrowsePageEl = {
      scope: () => {
        return {
          browse: _angularBrowseFn
        }
      }
    }
    const angular = {
      element: (t) => {
        if (t === '#browse-page') {
          return _angularBrowsePageEl;
        }
      }
    };
    window.angular = angular;
  }, [browse, socket]);

  return (
    <div
      ref={screenRef}
      className={layoutClasses}
      style={props.style}>
      <FakeLoadingBar ref={fakeLoadingBarRef} styles={styles} />
      <Toolbar
        ref={toolbarRefPassthrough}
        styles={styles}
        currentLocation={currentLocation.current}
        currentContents={contents}
        currentListView={listView}
        onButtonClick={handleToolbarButtonClicked}
        onSearchQuery={onSearchQuery}
        initialSearchQuery={restoreState.searchQuery || ''} />
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
