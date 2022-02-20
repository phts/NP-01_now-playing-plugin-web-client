import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Modal from "react-modal/lib/components/Modal";
import Button from "../common/Button";
import styles from './AddToPlaylistDialog.module.scss';
import { ServiceContext } from "../contexts/ServiceProvider";
import classNames from "classnames";
import { CSSTransition } from "react-transition-group";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

function AddToPlaylistDialog(props) {

  const { playlistService } = useContext(ServiceContext);
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

  const addToPlaylist = useCallback((e) => {
    playlistService.addToPlaylist(props.data.item, e.target.dataset.playlist);
    closeDialog();
  }, [playlistService, props.data, closeDialog]);

  const createAndAddToPlaylist = useCallback(() => {
    const playlist = createPlaylistTextBoxRef.current ? createPlaylistTextBoxRef.current.value : null;
    if (playlist) {
      playlistService.addToPlaylist(props.data.item, playlist);
      closeDialog();
    }
  }, [playlistService, props.data, closeDialog]);

  const addToFavorites = useCallback(() => {
    playlistService.addToFavorites(props.data.item);
    closeDialog();
  }, [playlistService, props.data, closeDialog]);

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

  const supportsHover = !window.matchMedia('(hover: none)').matches;

  return (
    <Modal
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
      <OverlayScrollbarsComponent
        className={styles.Layout__contents}
        options={{
          scrollbars: {
            autoHide: supportsHover ? 'leave' : 'scroll'
          }
        }}>
        {getPlaylists()}       
      </OverlayScrollbarsComponent>
      <div className={styles.Layout__footer}>
        <CSSTransition
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
        </CSSTransition>
        <CSSTransition
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
        </CSSTransition>
      </div>
    </Modal>
  );
}

export default AddToPlaylistDialog;
