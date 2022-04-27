import styles from './QueueScreen.module.scss';
import { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useSwipeable } from 'react-swipeable';
import { eventPathHasNoSwipe } from '../../utils/event';
import { useScreens } from '../../contexts/ScreenContextProvider';
import Toolbar from './Toolbar';
import { Scrollbars } from 'rc-scrollbars';
import Items from './Items';
import { useQueueService } from '../../contexts/ServiceProvider';
import { ADD_TO_PLAYLIST_DIALOG } from '../../modals/CommonModals';
import { useModals } from '../../contexts/ModalStateProvider';
import { useStore } from '../../contexts/StoreProvider';
import { usePlayerState } from '../../contexts/PlayerProvider';

const RESTORE_STATE_KEY = 'QueueScreen.restoreState';
const SCREEN_MAXIMIZED_KEY = 'screen.queue.maximized';

const isScreenMaximizable = () => window.innerWidth >= 1024;

function QueueScreen(props) {
  const store = useStore();
  const persistentStore = useStore('persistent');
  const restoreState = store.get(RESTORE_STATE_KEY, {}, true);
  const playerState = usePlayerState();
  const { openModal } = useModals();
  const queueService = useQueueService();
  const [items, setItems] = useState(queueService.getQueue());
  const {exitActiveScreen} = useScreens();
  const toolbarEl = useRef(null);
  const scrollbarsRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const [screenMaximizable, setScreenMaximizable] = useState(isScreenMaximizable());
  const [screenMaximized, maximizeScreen] = useState(persistentStore.get(SCREEN_MAXIMIZED_KEY) || false);

  // Detect window resize for updating screenMaximizable

  useEffect(() => {
    const updateScreenMaximizable = () => {
      setScreenMaximizable(isScreenMaximizable());
    };

    window.addEventListener('resize', updateScreenMaximizable);

    return () => { window.removeEventListener('resize', updateScreenMaximizable); };
  }, []);

  // -- Save screenMaximized to localStorage when its value changes

  useEffect(() => {
    persistentStore.set(SCREEN_MAXIMIZED_KEY, screenMaximized);
  }, [persistentStore, screenMaximized]);

  useEffect(() => {
    const handleQueueChanged = (data) => {
      setItems(data);
    };

    queueService.on('queueChanged', handleQueueChanged);

    return () => {
      queueService.off('queueChanged', handleQueueChanged);
    }
  }, [queueService, setItems]);

  // Keep track of scroll position and save to restoreState on unmount;
  // Restore scroll position on remount

  useEffect(() => {
    if (scrollbarsRef.current) {
      scrollbarsRef.current.scrollTop(restoreState.scrollPosition || 0);
    }

    return (() => {
      restoreState.scrollPosition = scrollPositionRef.current;
    });
  }, [restoreState]);
  
  const getScrollPosition = () => {
    if (scrollbarsRef.current) {
      return scrollbarsRef.current.getScrollTop() || 0;
    }
    else {
      return 0;
    }
  };

  scrollPositionRef.current = getScrollPosition();

  const closeScreen = useCallback(() => {
    exitActiveScreen({
      exitTransition: 'slideUp'
    });
  }, [exitActiveScreen]);

  const handleScreenClicked = useCallback((e) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      closeScreen();
    }
  }, [closeScreen]);

  const handleToolbarButtonClicked = useCallback((action) => {
    switch(action) {
      case 'close':
        closeScreen();
        break;
      case 'addToPlaylist':
        openModal(ADD_TO_PLAYLIST_DIALOG, {
          data: {
            addType: 'queue'
          }
        });
        break;
      case 'clear':
        queueService.clearQueue();
        break;
      case 'toggleScreenMaximize':
        maximizeScreen(!screenMaximized);
        break;
      default:
    }
  }, [closeScreen, openModal, queueService, screenMaximized]);

  const handleItemClicked = useCallback((position) => {
    queueService.playQueue(position);
  }, [queueService]);

  const handleRemoveClicked = useCallback((position) => {
    queueService.removeFromQueue(position);
  }, [queueService]);

  // Swipe handling
  const onToolbarSwiped = useCallback((e) => {  
    if (toolbarEl.current === null || eventPathHasNoSwipe(e.event, toolbarEl.current)) {
      return;
    }
    if (e.dir === 'Down') {
      closeScreen();
    }
  }, [closeScreen]);

  const toolbarSwipeHandler = useSwipeable({
    onSwiped: onToolbarSwiped
  });

  const toolbarRefPassthrough = (el) => {
    toolbarSwipeHandler.ref(el);
    toolbarEl.current = el;
  };

  const currentPlayingPosition = !isNaN(playerState.position) && 
    playerState.status === 'play' ? playerState.position : -1;

  const layoutWrapperClasses = classNames([
    styles.LayoutWrapper,
    props.className,
    screenMaximized ? styles['LayoutWrapper--maximized'] : null
  ]);

  return (
    <div 
      className={layoutWrapperClasses}
      style={props.style}
      onClick={handleScreenClicked}>
      <div className={styles.Layout}>
        <Toolbar 
          ref={toolbarRefPassthrough}
          styles={styles} 
          itemCount={items.length}
          playerState={playerState}
          onButtonClick={handleToolbarButtonClicked}
          screenMaximizable={screenMaximizable}
          screenMaximized={screenMaximized} />
        <Scrollbars
          ref={scrollbarsRef}
          className={styles.Layout__contents}
          classes={{
            thumbVertical: 'Scrollbar__handle'
          }}
          autoHide>
          <Items
            items={items} 
            currentPlayingPosition={currentPlayingPosition}
            onItemClick={handleItemClicked}
            onRemoveClick={handleRemoveClicked} />
        </Scrollbars>
      </div>
    </div>
  );
}

export default QueueScreen;
