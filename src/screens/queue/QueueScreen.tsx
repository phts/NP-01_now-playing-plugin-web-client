/// <reference types="../../declaration.d.ts" />

import styles from './QueueScreen.module.scss';
import React, { HTMLProps, SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { SwipeEventData, useSwipeable } from 'react-swipeable';
import { eventPathHasNoSwipe } from '../../utils/event';
import { ScreenProps, useScreens } from '../../contexts/ScreenContextProvider';
import Toolbar, { QueueScreenToolbarElement } from './Toolbar';
import { Scrollbars } from 'rc-scrollbars';
import Items from './Items';
import { useQueueService } from '../../contexts/ServiceProvider';
import { ADD_TO_PLAYLIST_DIALOG } from '../../modals/CommonModals';
import { useModals } from '../../contexts/ModalStateProvider';
import { useStore } from '../../contexts/StoreProvider';
import { usePlayerState } from '../../contexts/PlayerProvider';
import { QueueItem } from '../../services/QueueService';

export interface QueueScreenProps extends ScreenProps {
  screenId: 'Queue';
  className?: string;
  style?: HTMLProps<HTMLDivElement>['style'];
}

interface QueueScreenRestoreState {
  scrollPosition?: number;
}

const RESTORE_STATE_KEY = 'QueueScreen.restoreState';
const SCREEN_MAXIMIZED_KEY = 'screen.queue.maximized';

const isScreenMaximizable = () => window.innerWidth >= 1024;

function QueueScreen(props: QueueScreenProps) {
  const store = useStore();
  const persistentStore = useStore('persistent');
  const restoreState = store.get<QueueScreenRestoreState>(RESTORE_STATE_KEY, {}, true);
  const playerState = usePlayerState();
  const { openModal } = useModals();
  const queueService = useQueueService();
  const [ items, setItems ] = useState(queueService.getQueue());
  const {exitActiveScreen} = useScreens();
  const toolbarEl = useRef<QueueScreenToolbarElement | null>(null);
  const scrollbarsRef = useRef<Scrollbars | null>(null);
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

  useEffect(() => {
    const handleQueueChanged = (data: QueueItem[]) => {
      setItems(data);
    };

    queueService.on('queueChanged', handleQueueChanged);

    return () => {
      queueService.off('queueChanged', handleQueueChanged);
    };
  }, [ queueService, setItems ]);

  // Keep track of scroll position and save to restoreState on unmount;
  // Restore scroll position on remount

  useEffect(() => {
    if (scrollbarsRef.current) {
      scrollbarsRef.current.scrollTop(restoreState.scrollPosition || 0);
    }

    return (() => {
      restoreState.scrollPosition = scrollPositionRef.current;
    });
  }, [ restoreState ]);

  const getScrollPosition = () => {
    if (scrollbarsRef.current) {
      return scrollbarsRef.current.getScrollTop() || 0;
    }

    return 0;

  };

  scrollPositionRef.current = getScrollPosition();

  const closeScreen = useCallback(() => {
    exitActiveScreen({
      exitTransition: 'slideUp'
    });
  }, [ exitActiveScreen ]);

  const handleScreenClicked = useCallback((e: SyntheticEvent) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      closeScreen();
    }
  }, [ closeScreen ]);

  const handleToolbarButtonClicked = useCallback((action: string) => {
    switch (action) {
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
  }, [ closeScreen, openModal, queueService, screenMaximized ]);

  const handleItemClicked = useCallback((position: number) => {
    queueService.playQueue(position);
  }, [ queueService ]);

  const handleRemoveClicked = useCallback((position: number) => {
    queueService.removeFromQueue(position);
  }, [ queueService ]);

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
      closeScreen();
    }
  }, [ closeScreen ]);

  const toolbarSwipeHandler = useSwipeable({
    onSwiped: onToolbarSwiped
  });

  const toolbarRefPassthrough = (el: QueueScreenToolbarElement) => {
    toolbarSwipeHandler.ref(el);
    toolbarEl.current = el;
  };

  const currentPlayingPosition = playerState.position &&
    !isNaN(playerState.position) &&
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
