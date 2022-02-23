import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/css/OverlayScrollbars.css';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SocketContext } from '../../contexts/SocketProvider';
import styles from './BrowseScreen.module.scss';
import Section from './Section';
import 'font-awesome/css/font-awesome.min.css';
import FakeLoadingBar from './FakeLoadingBar';
import Toolbar from './Toolbar';
import { ModalStateContext } from '../../contexts/ModalStateProvider';
import Header from './Header';
import { NotificationContext } from '../../contexts/NotificationProvider';
import { ScreenContext } from '../../contexts/ScreenContextProvider';
import classNames from 'classnames';
import { eventPathHasNoSwipe } from '../../utils/event';
import { useSwipeable } from 'react-swipeable';
import { ACTION_PANEL, ADD_TO_PLAYLIST_DIALOG, WEB_RADIO_DIALOG } from '../../modals/CommonModals';
import { ServiceContext } from '../../contexts/ServiceProvider';
import { isPlayOnDirectClick } from './helper';

const HOME = {
  type: 'browse',
  uri: '',
  service: null
};

function BrowseScreen(props) {
  const socket = useContext(SocketContext);
  const showToast = useContext(NotificationContext);
  const { openModal } = useContext(ModalStateContext);
  const { playlistService, queueService, browseService } = useContext(ServiceContext);
  const [listView, setListView] = useState('grid');
  const [contents, setContents] = useState({});
  const currentLocation = useRef(HOME);
  const currentSearchQuery = useRef('');
  const scrollbarsRef = useRef(null);
  const fakeLoadingBarRef = useRef(null);
  const { switchScreen } = useContext(ScreenContext);
  const toolbarEl = useRef(null);


  // Browse / navigation handling

  useEffect(() => {
    const handleContentsLoaded = (data) => {
      if (!data.isBack) {
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
        message: data.error
      });
      stopFakeLoadingBar();
    };

    browseService.on('contentsLoaded', handleContentsLoaded);
    browseService.on('contentsRefreshed', handleContentsRefreshed);
    browseService.on('error', handleError);

    return () => {
      browseService.off('contentsLoaded', handleContentsLoaded);
      browseService.off('contentsRefreshed', handleContentsRefreshed);
      browseService.off('error', handleError);
    }
  }, [setContents, browseService, showToast]);

  const getScrollPosition = () => {
    const zero = { x: 0, y: 0 };
    if (scrollbarsRef.current) {
      const scroll = scrollbarsRef.current.osInstance().scroll() || {};
      return scroll.position || zero;
    }
    else {
      return zero;
    }
  };

  const browse = useCallback((location, refresh = false) => {
    startFakeLoadingBar();
    browseService.browse(location, refresh);
  }, [browseService]);

  const search = useCallback((query) => {
    startFakeLoadingBar();
    browseService.search(query);
  }, [browseService]);

  const goBack = useCallback(() => {
    startFakeLoadingBar();
    browseService.goBack();
  }, [browseService]);


  // Toolbar actions

  const toggleListView = useCallback(() => {
    setListView(listView === 'grid' ? 'list' : 'grid');
  }, [setListView, listView]);

  const onSearchQuery = useCallback((query, commit) => {
    currentSearchQuery.current = query;
    if (commit) {
      search(query);
    }
  }, [search]);

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
    fakeLoadingBarRef.current.start();
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
        currentContents={contents}
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
