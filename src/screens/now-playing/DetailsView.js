import TrackInfoText from '../../common/TrackInfoText';
import PlayerButtonGroup from '../../common/PlayerButtonGroup';
import Seekbar from '../../common/Seekbar';
import classNames from 'classnames';
import Image from '../../common/Image';
import styles from './DetailsView.module.scss';
import { ServiceContext } from '../../contexts/ServiceProvider';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { NotificationContext } from '../../contexts/NotificationProvider';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import Button from '../../common/Button';

function DetailsView(props) {
  const { playerState } = props;
  const { metadataService } = useContext(ServiceContext);
  const showToast = useContext(NotificationContext);
  const [state, setState] = useState({ status: 'idle' });
  const { title, artist, album } = playerState;
  const [infoType, setInfoType] = useState('song');
  const scrollbarsRef = useRef(null);

  useEffect(() => {
    if (metadataService) {
      const handleMetadataFetched = (data) => {
        const { params, info } = data;
        if (params.name !== undefined && params.name === title &&
          params.artist !== undefined && params.artist === artist &&
          params.album !== undefined && params.album === album) {
            setState({ status: 'fetched', info });
        }
      };

      const handleError = (message) => {
        showToast({
          type: 'error',
          message
        });
        setState({ status: 'error', error: {message} });
      };
      
      metadataService.on('fetched', handleMetadataFetched);
      metadataService.on('error', handleError);

      return () => {
        metadataService.off('fetched', handleMetadataFetched);
        metadataService.off('error', handleError);
      };
    }
  }, [metadataService, title, artist, album, setState, showToast]);

  useEffect(() => {
    if (metadataService) {
      if (title) {
        const params = {
          name: title,
          artist,
          album
        };
        metadataService.getSongInfo(params);
        setState({ status: 'loading' })
      }
      else {
        setState({ status: 'idle' });
      }
    }
    else {
      setState({
        status: 'error',
        error: {
          message: 'Metadata service unavailable. Check that you have the latest version of the Now Playing plugin installed.'
        }
      });
    }
  }, [metadataService, title, artist, album, setState]);

  const handleInfoTypeButtonClicked = useCallback((e) => {
    e.stopPropagation();
    const infoType = e.currentTarget.dataset.infoType;
    setInfoType(infoType);
  }, [setInfoType]);

  const playerButtonGroupClasses = classNames(
    [`${styles.PlayerButtonGroup}`],
    'no-swipe'
  );

  const infoTypeButtonStyles = {
    baseClassName: 'InfoTypeChooser__button',
    bundle: styles
  };

  const getImage = useCallback(() => {
    if (state.status !== 'fetched') {
      return playerState.albumart;
    }
    
    if (state.info[infoType]) {
      return state.info[infoType].image || playerState.albumart;
    }
    else {
      return playerState.albumart;
    }
  }, [playerState, infoType, state]);

  const getInfoComponent = useCallback(() => {
    if (state.status === 'idle') {
      return null;
    }

    if (state.status === 'loading') {
      const infoClassNames = classNames(styles.Info, styles['Info--loading'], 'no-swipe');
      return (
        <div className={infoClassNames}>
          <span className="material-icons DisconnectedIndicator__icon">rotate_right</span>
          <div>Loading...</div>
        </div>
      );
    }

    let contents = null, isEmpty = false;
    if (state.status === 'fetched') {
      if (infoType === 'song' || infoType === 'artist' || infoType === 'album') {
        const description = state.info[infoType] ? state.info[infoType].description : null;
        isEmpty = !description || description === '?';
        contents = !isEmpty ? description : `${infoType} description unavailable`;
      }
      else if (infoType === 'lyrics') {
        isEmpty = !state.info.song || !state.info.song.embedContents || state.info.song.embedContents.contentParts.length === 0;
        if (!isEmpty) {
          // Strip links first
          const embedContents = state.info.song.embedContents.contentParts.join();
          const wrapper = document.createElement('div');
          wrapper.innerHTML = embedContents;
          const anchors = Array.from(wrapper.getElementsByTagName('a'));
          for (const anchor of anchors) {
            anchor.replaceWith(...anchor.childNodes);
          }

          contents = <div 
            className={styles.Lyrics} 
            dangerouslySetInnerHTML={{__html: wrapper.innerHTML}} /> 
        }
        else {
          contents = `${infoType} unavailable`;
        }
      }
    }
    else if (state.status === 'error') {
      isEmpty = true;
      contents = state.error.message;
    }
    
    const infoClassNames = classNames(
      styles.Info,
      isEmpty ? styles['Info--empty'] : null,
      'no-swipe');
    if (!isEmpty) {
      const supportsHover = !window.matchMedia('(hover: none)').matches;
      return (
        <OverlayScrollbarsComponent
          ref={scrollbarsRef}
          className={infoClassNames}
          options={{
            scrollbars: {
              autoHide: supportsHover ? 'leave' : 'scroll'
            }
          }}>
          {contents}
        </OverlayScrollbarsComponent>
      );  
    }
    else {
      return (
        <div className={infoClassNames}>
          <span className='material-icons'>sentiment_very_dissatisfied</span>
          <div>{contents}</div>
        </div>
      );
    }

  }, [state, infoType]);

  useEffect(() => {
    if (scrollbarsRef.current) {
      scrollbarsRef.current.osInstance().scroll(0);
    }
  }, [infoType, state]);

  return (
    <div className={styles.Layout}>
      <div className={styles.TitleBar}>
        <TrackInfoText
          styles={{
            baseClassName: 'TrackInfoText',
            bundle: styles
          }}
          concatArtistAlbum
          playerState={playerState} />
        <div className={styles.InfoTypeChooser}>
          <Button
            icon="audiotrack"
            styles={infoTypeButtonStyles}
            toggleable
            toggled={infoType === 'song'}
            onClick={handleInfoTypeButtonClicked}
            data-info-type="song" />
          <Button
            icon="person_outline"
            styles={infoTypeButtonStyles}
            toggleable
            toggled={infoType === 'artist'}
            onClick={handleInfoTypeButtonClicked}
            data-info-type="artist" />
          <Button
            icon="album"
            styles={infoTypeButtonStyles}
            toggleable
            toggled={infoType === 'album'}
            onClick={handleInfoTypeButtonClicked}
            data-info-type="album" />
          <Button
            icon="abc"
            styles={infoTypeButtonStyles}
            toggleable
            toggled={infoType === 'lyrics'}
            onClick={handleInfoTypeButtonClicked}
            data-info-type="lyrics" />
        </div>
      </div>
      <div className={styles.Contents}>
        <div className={styles.Art}>
          <Image className={styles.Art__image} src={getImage()} preload={true} />
        </div>
        {getInfoComponent()}
      </div>
      <div className={styles.BottomBar}>
        <Seekbar
          styles={{
            baseClassName: 'Seekbar',
            bundle: styles
          }}
          playerState={playerState} />
        <PlayerButtonGroup
          className={playerButtonGroupClasses}
          buttonStyles={{
            baseClassName: 'PlayerButton',
            bundle: styles
          }}
          playerState={playerState} />
      </div>
    </div>
  );
}

export default DetailsView;
