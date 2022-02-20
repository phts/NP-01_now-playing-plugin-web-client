import styles from './QueueScreen.module.scss';
import { SocketContext } from '../../contexts/SocketProvider';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { PlayerStateContext } from '../../contexts/PlayerStateProvider';
import classNames from 'classnames';
import { useSwipeable } from 'react-swipeable';
import { eventPathHasNoSwipe } from '../../utils/event';
import { ScreenContext } from '../../contexts/ScreenContextProvider';
import Toolbar from './Toolbar';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import Items from './Items';

function QueueScreen(props) {
  const playerState = useContext(PlayerStateContext);
  const socket = useContext(SocketContext);
  const [items, setItems] = useState([]);
  const {exitActiveScreen} = useContext(ScreenContext);
  const toolbarEl = useRef(null);

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
      case 'clear':
        socket.emit('clearQueue');
        break;
      default:
    }
  }, [closeScreen, socket]);

  const handleItemClicked = useCallback((position) => {
    socket.emit('play', { value: position });
  }, [socket]);

  const handleRemoveClicked = useCallback((position) => {
    socket.emit('removeFromQueue', { value: position });
  }, [socket]);

  const handlePushQueue = useCallback((data) => {
    setItems(data);
  }, [setItems]);

  useEffect(() => {
    if (socket) {
      socket.on('pushQueue', handlePushQueue);

      return () => {
        socket.off('pushQueue', handlePushQueue);
      }
    }
  }, [socket, handlePushQueue]);

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
