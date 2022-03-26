import { useCallback, useEffect, useRef, useState } from "react";
import Button from "../common/Button";
import styles from './AddToPlaylistDialog.module.scss';
import { usePlaylistService } from "../contexts/ServiceProvider";
import classNames from "classnames";
import { Scrollbars } from 'rc-scrollbars';
import ContextualCSSTransition from "../common/ContextualCSSTransition";
import ContextualModal from "../common/ContextualModal";

function AddToPlaylistDialog(props) {

  const playlistService = usePlaylistService();
  const [playlists, setPlaylists] = useState([]);
  const [createPlaylistMode, setCreatePlaylistMode] = useState(false);
  const overlayEl = useRef(null);
  const createPlaylistTextBoxRef = useRef(null);
  const createPlaylistConfirmButtonRef = useRef(null);
  const { closeDialog } = props;

  useEffect(() => {
    const handlePlaylistsChanged = (data) => {
      setPlaylists(data);
    };

    playlistService.on('playlistsChanged', handlePlaylistsChanged);
    setPlaylists(playlistService.getPlaylists());

    return () => {
      playlistService.off('playlistsChanged', handlePlaylistsChanged);
    }
  }, [setPlaylists, playlistService]);

  const modalOverlayClassNames = {
    base: styles.Overlay,
    afterOpen: styles['Overlay--after-open'],
    beforeClose: styles['Overlay--before-close']
  };

  const modalClassNames = {
    base: `${styles.Layout}`,
    afterOpen: styles['Layout--after-open'],
    beforeClose: styles['Layout--before-close']
  };

  const doAdd = useCallback((playlist) => {
    const addType = props.modalData.addType;
    if (addType === 'item' && props.modalData.item) {
      playlistService.addToPlaylist(props.modalData.item, playlist);
    }
    else if (addType === 'queue') {
      playlistService.addQueueToPlaylist(playlist);
    }
  }, [props.modalData, playlistService]);

  const addToPlaylist = useCallback((e) => {
    doAdd(e.target.dataset.playlist);
    closeDialog();
  }, [doAdd, closeDialog]);

  const createAndAddToPlaylist = useCallback(() => {
    const playlist = createPlaylistTextBoxRef.current ? createPlaylistTextBoxRef.current.value : null;
    if (playlist) {
      doAdd(playlist);
      closeDialog();
    }
  }, [doAdd, closeDialog]);

  const addToFavorites = useCallback(() => {
    playlistService.addToFavorites(props.modalData.item);
    closeDialog();
  }, [playlistService, props.modalData, closeDialog]);

  const getPlaylists = useCallback(() => {
    return (<ul className={styles.Playlists}>
      <li
        key="Favorites"
        className={styles.Playlists__item}
        onClick={addToFavorites}>
        Favorites
        <span className={classNames('material-icons', styles['Playlists__item--favorites'])}>favorite</span>
      </li>
      {playlists.map((playlist, index) => (
        <li
          key={`${playlist}_${index}`}
          className={styles.Playlists__item}
          data-playlist={playlist}
          onClick={addToPlaylist}>
          {playlist}
        </li>
      ))}
    </ul>);
  }, [playlists, addToFavorites, addToPlaylist]);

  const toggleCreatePlaylistMode = () => {
    setCreatePlaylistMode(!createPlaylistMode);
  };

  const wrapperTransitionClassNames = {
    enter: styles['Wrapper--fadeIn-enter'],
    enterActive: styles['Wrapper--fadeIn-enter-active'],
    enterDone: styles['Wrapper--fadeIn-enter-done'],
    exit: styles['Wrapper--fadeIn-exit'],
    exitActive: styles['Wrapper--fadeIn-exit-active'],
    exitDone: styles['Wrapper--fadeIn-exit-done']
  };

  const onEnterCreatePlaylistMode = () => {
    if (createPlaylistTextBoxRef.current) {
      createPlaylistTextBoxRef.current.focus();
    }
  };

  const onDialogClose = () => {
    if (createPlaylistMode) {
      setCreatePlaylistMode(false);
    }
  };

  const onDialogOpen = () => {
    playlistService.refreshPlaylists();
    if (createPlaylistTextBoxRef.current) {
      createPlaylistTextBoxRef.current.value = '';
    }
    if (createPlaylistConfirmButtonRef.current) {
      createPlaylistConfirmButtonRef.current.disabled = true;
    }
  };

  const onCreatePlaylistTextBoxChange = (e) => {
    if (!createPlaylistConfirmButtonRef.current) {
      return;
    }
    createPlaylistConfirmButtonRef.current.disabled = e.target.value.length === 0;
  };

  return (
    <ContextualModal
      closeTimeoutMS={200}
      overlayClassName={modalOverlayClassNames}
      className={modalClassNames}
      overlayRef={node => (overlayEl.current = node)}
      onAfterOpen={onDialogOpen}
      onAfterClose={onDialogClose}
      {...props}>
      <div className={styles.Layout__header}>
        <span className={styles.Title}>Add To...</span>
        <Button
          styles={{
            baseClassName: 'Button',
            bundle: styles,
            extraClassNames: [styles['Button--close']]
          }}
          icon="close"
          onClick={closeDialog} />
      </div>
      <Scrollbars
        className={styles.Layout__contents}
        classes={{
          thumbVertical: 'Scrollbar__handle'
        }}
        autoHide>
        {getPlaylists()}       
      </Scrollbars>
      <div className={styles.Layout__footer}>
        <ContextualCSSTransition
          in={!createPlaylistMode}
          classNames={wrapperTransitionClassNames}
          timeout={200}>
            <div className={styles.CreatePlaylistButtonWrapper}>
              <Button
                styles={{
                  baseClassName: 'Button',
                  bundle: styles,
                  extraClassNames: [styles['Button--create']]
                }}
                icon="add"
                text="Create new playlist"
                onClick={toggleCreatePlaylistMode}
              />
            </div>
        </ContextualCSSTransition>
        <ContextualCSSTransition
          in={createPlaylistMode}
          classNames={wrapperTransitionClassNames}
          timeout={200}
          onEntered={onEnterCreatePlaylistMode}>
            <div className={styles.CreatePlaylistInputWrapper}>
              <Button
                styles={{
                  baseClassName: 'Button',
                  bundle: styles,
                  extraClassNames: [styles['Button--createBack']]
                }}
                icon="arrow_back"
                onClick={toggleCreatePlaylistMode}
              />
              <input 
                type="text" 
                ref={createPlaylistTextBoxRef}
                className={styles.CreatePlaylistTextBox}
                placeholder="Enter playlist name"
                onChange={onCreatePlaylistTextBoxChange} />
              <Button
                ref={createPlaylistConfirmButtonRef}
                styles={{
                  baseClassName: 'Button',
                  bundle: styles,
                  extraClassNames: [styles['Button--confirmCreate']]
                }}
                text="Create"
                disabled
                onClick={createAndAddToPlaylist} />
            </div>
        </ContextualCSSTransition>
      </div>
    </ContextualModal>
  );
}

export default AddToPlaylistDialog;
