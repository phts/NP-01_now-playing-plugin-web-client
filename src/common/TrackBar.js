import classNames from 'classnames';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { ModalStateContext } from '../contexts/ModalStateProvider';
import { PlayerStateContext } from '../contexts/PlayerStateProvider';
import { ScreenContext } from '../contexts/ScreenContextProvider';
import { VOLUME_INDICATOR } from '../modals/CommonModals';
import { eventPathHasNoSwipe } from '../utils/event';
import Button from './Button';
import ContextualModal from './ContextualModal';
import Image from './Image';
import PlayerButtonGroup from './PlayerButtonGroup';
import Seekbar from './Seekbar';
import styles from './TrackBar.module.scss';
import TrackInfoText from './TrackInfoText';
import VolumeSlider from './VolumeSlider';

function TrackBar(props) {
  const playerState = useContext(PlayerStateContext);
  const {disableModal, enableModal} = useContext(ModalStateContext);
  const {switchScreen, exitActiveScreen} = useContext(ScreenContext);
  const [volumeBarVisible, showVolumeBar] = useState(false);
  const trackBarEl = useRef(null);

  const emptyTrackInfoText = 
    (playerState.title === undefined || playerState.title === '') &&
    (playerState.artist === undefined || playerState.artist === '') &&
    (playerState.album === undefined || playerState.album === '');
  const seekable = (playerState.duration > 0 && playerState.status !== 'stop');
  const seekbarVisible = !emptyTrackInfoText && seekable;

  const showQueue = useCallback(() => {
    switchScreen({
      screenId: 'Queue',
      enterTransition: 'slideUp'
    });
  }, [switchScreen])

  const toggleQueue = useCallback(() => {
    if (props.activeScreenId === 'Queue') {
      exitActiveScreen({
        exitTransition: 'slideUp'
      });
    }
    else {
      showQueue();
    }
  }, [props.activeScreenId, exitActiveScreen, showQueue]);

  const switchToNowPlaying = useCallback(() => {
    switchScreen({
      screenId: 'NowPlaying'
    })
  }, [switchScreen]);

  const toggleVolumeBar = useCallback(() => {
    showVolumeBar(!volumeBarVisible);
  }, [showVolumeBar, volumeBarVisible]);

  // Swipe handling
  const onTrackBarSwiped = useCallback((e) => {  
    if (trackBarEl.current === null || eventPathHasNoSwipe(e.event, trackBarEl.current)) {
      return;
    }
    if (e.dir === 'Up') {
      showQueue();
    }
  }, [showQueue]);

  const trackBarSwipeHandler = useSwipeable({
    onSwiped: onTrackBarSwiped
  });

  const trackBarRefPassthrough = (el) => {
    trackBarSwipeHandler.ref(el);
    trackBarEl.current = el;
  };

  // Disable the Volume Indicator modal from showing
  // when Volume Bar is shown
  useEffect(() => {
    if (volumeBarVisible) {
      disableModal(VOLUME_INDICATOR);
    }
    else {
      enableModal(VOLUME_INDICATOR);
    }
  }, [volumeBarVisible, disableModal, enableModal]);

  const queueButton = (
    <Button 
      key="queue"
      icon="queue_music"
      toggleable={true}
      toggled={props.activeScreenId === 'Queue' || props.enteringScreenId === 'Queue'}
      styles={{
        baseClassName: 'Button',
        bundle: styles,
        extraClassNames: [styles['Button--queue']]
      }}
      onClick={toggleQueue} />
  );

  const volumeButton = (
    <Button 
      key="volume"
      icon="volume_up"
      styles={{
        baseClassName: 'Button',
        bundle: styles,
        extraClassNames: [styles['Button--volume']]
      }}
      onClick={toggleVolumeBar} />
  );

  const mainClassNames = classNames([
    styles.Layout,
    !seekbarVisible ? styles['Layout--noSeek'] : null,
    props.state === 'inactive' ? styles['Layout--inactive'] : null,
    props.className
  ]);

  const volumeBarClassNames = {
    base: styles.VolumeBarWrapper,
    afterOpen: styles['VolumeBarWrapper--after-open'],
    beforeClose: styles['VolumeBarWrapper--before-close']
  }

  return (
    <>
    <div ref={trackBarRefPassthrough} className={mainClassNames}>
      {seekbarVisible ?
        <Seekbar
          styles={{
            baseClassName: 'Seekbar',
            bundle: styles
          }}
          showText={false}
          playerState={playerState} />
        : null}
      <div className={styles.Layout__contents}>
        <div className={styles.AlbumArt}>
          <Image 
            className={styles.AlbumArt__image} 
            src={playerState.albumart} 
            preload={true} 
            onClick={switchToNowPlaying} />
        </div>
        {!emptyTrackInfoText ?
          <TrackInfoText
            styles={{
              baseClassName: 'TrackInfoText',
              bundle: styles
            }}
            concatArtistAlbum={true}
            playerState={playerState}
            onClick={switchToNowPlaying} />
          : null}
        <PlayerButtonGroup
          className={classNames([styles.PlayerButtonGroup, 'no-swipe'])}
          buttonStyles={{
            baseClassName: 'Button',
            bundle: styles
          }}
          buttons={[queueButton, 'previous', 'play', 'next', volumeButton]}
          playerState={playerState} />
      </div>
    </div>
    <ContextualModal 
      isOpen={volumeBarVisible}
      closeTimeoutMS={200}
      overlayClassName={styles.VolumeBarOverlay}
      className={volumeBarClassNames}
      preventScroll={true}
      onRequestClose={toggleVolumeBar}>
      <div className={styles.VolumeBar}>
        <VolumeSlider orientation="vertical" />
      </div>
    </ContextualModal>
    </>
  );
}

export default TrackBar;
