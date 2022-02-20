import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/css/OverlayScrollbars.css';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppContext } from '../../contexts/AppContextProvider';
import { SocketContext } from '../../contexts/SocketProvider';
import styles from './BrowseScreen.module.scss';
import Section from './Section';
import 'font-awesome/css/font-awesome.min.css';
import FakeLoadingBar from './FakeLoadingBar';
import Toolbar from './Toolbar';
import { ModalStateContext } from '../../contexts/ModalStateProvider';
import Header from './Header';
import { isHome } from './helper';
import { NotificationContext } from '../../contexts/NotificationProvider';
import { ScreenContext } from '../../contexts/ScreenContextProvider';
import classNames from 'classnames';
import { eventPathHasNoSwipe } from '../../utils/event';
import { useSwipeable } from 'react-swipeable';
import { ACTION_PANEL, ADD_TO_PLAYLIST_DIALOG, WEB_RADIO_DIALOG } from '../../modals/CommonModals';
import { ServiceContext } from '../../contexts/ServiceProvider';

const HOME = {
  type: 'browse',
  uri: '',
  service: null
};

function BrowseScreen(props) {
  const socket = useContext(SocketContext);
  const { host } = useContext(AppContext);
  const showToast = useContext(NotificationContext);
  const { openModal } = useContext(ModalStateContext);
  const { playlistService, queueService } = useContext(ServiceContext);
  const [listView, setListView] = useState('grid');
  const [contents, setContents] = useState({});
  const browseSources = useRef([]);
  const currentLocation = useRef(HOME);
  const currentLoading = useRef(null);
  const currentSearchQuery = useRef('');
  const backHistory = useRef([]);
  const scrollbarsRef = useRef(null);
  const fakeLoadingBarRef = useRef(null);
  const { switchScreen } = useContext(ScreenContext);
  const toolbarEl = useRef(null);
  const lastAction = useRef(null);

  const requestRestApi = (url, callback) => {
    fetch(url)
      .then(res => res.json())
      .then(
        data => callback && callback(data)
      );
  };

  const resetCurrentLoading = useCallback((completeFakeLoadingBar = false) => {
    stopFakeLoadingBar(completeFakeLoadingBar);
    currentLoading.current = null;
  }, []);

  const showBrowseSources = useCallback(() => {
    setContents({
      navigation: {
        lists: [{
          items: browseSources.current,
          availableListViews: ['grid']
        }]
      }
    });
  }, [setContents]);

  const addToBackHistory = (location) => {
    backHistory.current.push(location);
  }

  const getScrollPosition = () => {
    const zero = { x: 0, y: 0 };
    if (scrollbarsRef.current) {
      const scroll = scrollbarsRef.current.osInstance().scroll() || {};
      return scroll.position || zero;
    }
    else {
      return zero;
    }
  }

  const browse = useCallback((location, refresh = false) => {
    if (location.type !== 'browse') {
      return;
    }
    resetCurrentLoading();
    if (isHome(location)) {
      currentLocation.current = HOME;
      showBrowseSources();
      backHistory.current = [];
    }
    else {
      currentLoading.current = location;
      let requestUrl = `${host}/api/v1/browse?uri=${encodeURIComponent(encodeURIComponent(location.uri))}`;
      startFakeLoadingBar();
      requestRestApi(requestUrl, data => {
        if (currentLoading.current && currentLoading.current.type === 'browse' &&
          currentLoading.current.uri === location.uri) {
          if (data.error) {
            showToast({
              type: 'error',
              message: data.error
            });
            resetCurrentLoading();
          }
          else {
            // Add to back history
            if (!isHome(currentLocation.current) && !refresh) {
              currentLocation.current.contents.__scroll = getScrollPosition();
              addToBackHistory(currentLocation.current);
            }
            // Set current location, then update contents
            location.contents = data;
            currentLocation.current = location;
            if (refresh) {
              data.__scroll = getScrollPosition();
            }
            setContents(data);
            resetCurrentLoading(true);
          }
        }
      });
    }
  }, [showBrowseSources, host, showToast, resetCurrentLoading, setContents]);

  const search = useCallback((query) => {
    // Volumio REST API for search does NOT have the same implementation as Websocket API!
    // Must use Websocket because REST API does not allow for source-specific searching.
    const payload = {
      value: query
      // In Volumio musiclibrary.js, the payload also has a 'uri' field - what is it used for???
    }
    const searchLocation = {
      type: 'search',
      query,
      service: null
    };
    if (currentLocation.current.service) {
      payload.service = currentLocation.current.service.name;
      searchLocation.service = currentLocation.current.service;
    }
    currentLoading.current = searchLocation;
    startFakeLoadingBar();
    socket.emit('search', payload);
  }, [socket])

  const onSearchQuery = useCallback((query, commit) => {
    currentSearchQuery.current = query;
    if (commit) {
      search(query);
    }
  }, [search]);

  const goBack = useCallback(() => {
    startFakeLoadingBar();
    const prevLocation = backHistory.current.pop();
    if (!prevLocation || isHome(prevLocation)) {
      browse(HOME);
    }
    else if (prevLocation.type === 'browse' || prevLocation.type === 'search') {
      currentLocation.current = prevLocation;
      setContents(prevLocation.contents);
    }
    stopFakeLoadingBar(true);
  }, [browse, setContents]);

  const toggleListView = useCallback(() => {
    setListView(listView === 'grid' ? 'list' : 'grid');
  }, [setListView, listView]);

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

  const isPlayOnDirectClick = (itemType) => {
    const playOnDirectClickTypes = [
      'song',
      'webradio',
      'mywebradio',
      'cuesong'/*,
      'cd' // What's this? Can see in Volumio UI code but not in the backend...Leaving it out until I know how it's actually used
      */
    ]
    return playOnDirectClickTypes.includes(itemType);
  };

  const doPlayOnClick = useCallback((item, list, itemIndex) => {
    if (item.type === 'cuesong') {
      socket.emit('addPlayCue', {
        uri: item.uri,
        number: item.number,
        service: (item.service || null)
      });
    }
    else if (item.type === 'playlist') {
      socket.emit('playPlaylist', {
        name: item.title
      });
    }
    else {
      const playEntireListTypes = [
        'song'
      ];
      if (playEntireListTypes.includes(item.type) && list && itemIndex !== undefined) {
        socket.emit('playItemsList', {
          item,
          list: list.items,
          index: itemIndex
        });
      }
      else {
        socket.emit('playItemsList', { item });
      }
    }
  }, [socket]);

  const handleItemClicked = useCallback((item, list, itemIndex) => {
    if (!item.uri) {
      return;
    }

    if (isPlayOnDirectClick(item.type)) {
      doPlayOnClick(item, list, itemIndex);
    }
    else {
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
          const itemService = browseSources.current.find(source => source.plugin_name === item.service);
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

      browse(targetLocation);
    }
  }, [doPlayOnClick, browse]);

  const handlePlayClicked = useCallback((item, list, itemIndex) => {
    doPlayOnClick(item, list, itemIndex);
  }, [doPlayOnClick]);

  const updateBrowseSources = useCallback((sources) => {
    browseSources.current = sources;
    if (isHome(currentLocation.current) ||
      (currentLoading.current && isHome(currentLoading.current))) {
      showBrowseSources();
    }
  }, [showBrowseSources]);

  const showSearchResults = useCallback((data) => {
    const loading = currentLoading.current;
    if (!loading || loading.type !== 'search' || loading.query !== currentSearchQuery.current) {
      return;
    }
    if (data.navigation) {
      // Add to back history
      if (!isHome(currentLocation.current)) {
        currentLocation.current.contents.__scroll = getScrollPosition();
        addToBackHistory(currentLocation.current);
      }
      // Set current location, then update contents
      const location = Object.assign({}, loading, { contents: data });
      currentLocation.current = location;
      setContents(data);
    }
    resetCurrentLoading(true);
  }, [setContents, resetCurrentLoading]);

  const handlePushBrowseLibrary = useCallback((data) => {
    // Only handle certain cases.
    // For browsing library we use REST API
    // -- Search results
    if (data.navigation && data.navigation.isSearchResult) {
      showSearchResults(data);
    }
    // -- Actions that expect a pushBrowseLibrary response (and current 
    // location has not changed)
    else if (lastAction.current && 
      lastAction.current.expectsPushBrowseLibrary &&
      lastAction.current.originatingUri === currentLocation.current.uri) {
        currentLocation.current.contents = data;
        currentLocation.current.contents.__scroll = getScrollPosition();
        setContents(data);
      lastAction.current = null;
    }
  }, [showSearchResults]);

  const handlePushAddAWebRadio = useCallback((result) => {
    if (result.success && currentLocation.current.uri === 'radio/myWebRadio') {
      browse(currentLocation.current, true);
    }
  }, [browse])

  useEffect(() => {
    if (socket) {
      socket.on('pushBrowseSources', updateBrowseSources);
      socket.on('pushBrowseLibrary', handlePushBrowseLibrary);
      socket.on('pushAddWebRadio', handlePushAddAWebRadio);

      return () => {
        socket.off('pushBrowseSources', updateBrowseSources);
        socket.off('pushBrowseLibrary', handlePushBrowseLibrary);
        socket.off('pushAddWebRadio', handlePushAddAWebRadio);
      }
    }
  }, [socket, updateBrowseSources, handlePushBrowseLibrary, handlePushAddAWebRadio]);

  const callItemAction = useCallback((item, list, itemIndex, action) => {
    let expectsPushBrowseLibrary = false;
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
      openModal(ADD_TO_PLAYLIST_DIALOG, { data: { item } });
    }
    else if (action === 'removeFromPlaylist') {
      playlistService.removeFromPlaylist(item, currentLocation.current.browseItem.title);
      expectsPushBrowseLibrary = true;
    }
    else if (action === 'deletePlaylist') {
      playlistService.deletePlaylist(item.title);
      expectsPushBrowseLibrary = true;
    }
    else if (action === 'removeDrive') {
      socket.emit('safeRemoveDrive', item.title);
      expectsPushBrowseLibrary = true;
    }
    else if (action === 'updateFolder') {
      socket.emit('updateDb', item.uri);
    }
    else if (action === 'deleteFolder') {
      socket.emit('deleteFolder', { 'curUri': currentLocation.current.uri, 'item': item });
      expectsPushBrowseLibrary = true;
    }
    else if (action === 'addToFavorites') {
      playlistService.addToFavorites(item);
    }
    else if (action === 'removeFromFavorites') {
      playlistService.removeFromFavorites(item);
      expectsPushBrowseLibrary = true;
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
      expectsPushBrowseLibrary = true;
    }
    else if (action === 'addWebRadioToFavorites') {
      playlistService.addWebRadioToFavorites(item);
    }
    else if (action === 'removeWebRadioFromFavorites') {
      playlistService.removeWebRadioFromFavorites(item);
      expectsPushBrowseLibrary = true;
    }
    lastAction.current = {
      action: action,
      expectsPushBrowseLibrary,
      originatingUri: currentLocation.current.uri
    };
  }, [queueService, playlistService, openModal, socket]);

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
        <Header info={contents.navigation.info} onPlayClick={handlePlayClicked} />
      );
    }
    return null;
  }, [contents.navigation, handlePlayClicked]);

  useEffect(() => {
    if (scrollbarsRef.current) {
      scrollbarsRef.current.osInstance().scroll(contents.__scroll || 0);
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
    if (currentLoading.current) {
      fakeLoadingBarRef.current.start();
    }
  };

  const stopFakeLoadingBar = (complete = false) => {
    if (!fakeLoadingBarRef.current) {
      return;
    }
    fakeLoadingBarRef.current.stop(complete);
  };

  const supportsHover = !window.matchMedia('(hover: none)').matches;
  const layoutClasses = classNames([
    styles.Layout,
    ...props.className
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
      className={layoutClasses}
      style={props.style}>
      <FakeLoadingBar ref={fakeLoadingBarRef} styles={styles} />
      <Toolbar
        ref={toolbarRefPassthrough}
        styles={styles}
        currentLocation={currentLocation.current}
        currentListView={listView}
        onButtonClick={handleToolbarButtonClicked}
        onSearchQuery={onSearchQuery} />
      <OverlayScrollbarsComponent
        ref={scrollbarsRef}
        className={styles.Layout__contents}
        options={{
          scrollbars: {
            autoHide: supportsHover ? 'leave' : 'scroll'
          }
        }}>
        {header}
        <div className={styles.Contents}>{sections}</div>
      </OverlayScrollbarsComponent>
    </div>
  );
}

export default BrowseScreen;
