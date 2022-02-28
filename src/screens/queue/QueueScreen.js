import styles from './QueueScreen.module.scss';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { PlayerStateContext } from '../../contexts/PlayerStateProvider';
import classNames from 'classnames';
import { useSwipeable } from 'react-swipeable';
import { eventPathHasNoSwipe } from '../../utils/event';
import { ScreenContext } from '../../contexts/ScreenContextProvider';
import Toolbar from './Toolbar';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import Items from './Items';
import { ServiceContext } from '../../contexts/ServiceProvider';
import { ADD_TO_PLAYLIST_DIALOG } from '../../modals/CommonModals';
import { ModalStateContext } from '../../contexts/ModalStateProvider';

function QueueScreen(props) {
  const playerState = useContext(PlayerStateContext);
  const { openModal } = useContext(ModalStateContext);
  const { queueService } = useContext(ServiceContext);
  const [items, setItems] = useState(queueService.getQueue());
  const {exitActiveScreen} = useContext(ScreenContext);
  const toolbarEl = useRef(null);

  useEffect(() => {
    const handleQueueChanged = (data) => {
      setItems(data);
    };

    queueService.on('queueChanged', handleQueueChanged);

    return () => {
      queueService.off('queueChanged', handleQueueChanged);
    }
  }, [queueService, setItems]);

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
    ...props.className
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
