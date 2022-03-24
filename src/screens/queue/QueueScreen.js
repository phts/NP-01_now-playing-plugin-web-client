import styles from './QueueScreen.module.scss';
import { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useSwipeable } from 'react-swipeable';
import { eventPathHasNoSwipe } from '../../utils/event';
import { useScreens } from '../../contexts/ScreenContextProvider';
import Toolbar from './Toolbar';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import Items from './Items';
import { useQueueService } from '../../contexts/ServiceProvider';
import { ADD_TO_PLAYLIST_DIALOG } from '../../modals/CommonModals';
import { useModals } from '../../contexts/ModalStateProvider';
import { useStore } from '../../contexts/StoreProvider';
import { usePlayerState } from '../../contexts/PlayerProvider';

const INITIAL_SCROLL_POSITION = { x: 0, y: 0 };
const RESTORE_STATE_KEY = 'QueueScreen.restoreState';

function QueueScreen(props) {
  const store = useStore();
  const restoreState = store.get(RESTORE_STATE_KEY, {}, true);
  const playerState = usePlayerState();
  const { openModal } = useModals();
  const queueService = useQueueService();
  const [items, setItems] = useState(queueService.getQueue());
  const {exitActiveScreen} = useScreens();
  const toolbarEl = useRef(null);
  const scrollbarsRef = useRef(null);
  const scrollPositionRef = useRef(INITIAL_SCROLL_POSITION);

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
      scrollbarsRef.current.osInstance().scroll(restoreState.scrollPosition || 0);
    }

    return (() => {
      restoreState.scrollPosition = scrollPositionRef.current;
    });
  }, [restoreState]);
  
  const getScrollPosition = () => {
    if (scrollbarsRef.current) {
      const scroll = scrollbarsRef.current.osInstance().scroll() || {};
      return scroll.position || INITIAL_SCROLL_POSITION;
    }
    else {
      return INITIAL_SCROLL_POSITION;
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
      default:
    }
  }, [closeScreen, openModal, queueService]);

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

  const supportsHover = !window.matchMedia('(hover: none)').matches;

  const currentPlayingPosition = !isNaN(playerState.position) && 
    playerState.status === 'play' ? playerState.position : -1;

  const layoutWrapperClasses = classNames([
    styles.LayoutWrapper,
    props.className
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
          onButtonClick={handleToolbarButtonClicked} />
        <OverlayScrollbarsComponent
          ref={scrollbarsRef}
          className={styles.Layout__contents}
          options={{ scrollbars: {
            autoHide: supportsHover ? 'leave' : 'scroll'
          } }}>
          <Items
            items={items} 
            currentPlayingPosition={currentPlayingPosition}
            onItemClick={handleItemClicked}
            onRemoveClick={handleRemoveClicked} />
        </OverlayScrollbarsComponent>
      </div>
    </div>
  );
}

export default QueueScreen;
