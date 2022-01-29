import { useCallback, useContext } from 'react';
import { AppContext } from '../contexts/AppContextProvider';
import './TrackInfoText.scss';
import { getFormatIcon, getFormatResolution } from '../utils/track';
import classNames from 'classnames';

function TrackInfoText(props) {
  const { host } = useContext(AppContext);
  const playerState = props.playerState;
  const title = playerState.title || '';
  const artist = playerState.artist || '';
  const album = playerState.album || '';
  const formatResolution = getFormatResolution(playerState);
  const formatIcon = getFormatIcon(playerState.trackType, host);

  const baseClassName = props.styles ? props.styles.baseClassName : null;
  const stylesBundle = baseClassName ? props.styles.bundle : null;
  const extraClassNames = (props.styles ? props.styles.extraClassNames : null) || [];

  const mainClassName = (baseClassName && stylesBundle) ? 
    classNames(
      stylesBundle[baseClassName] || 'TrackInfoText',
      [...extraClassNames]
    )
    :
    classNames(
      'TrackInfoText',
      [...extraClassNames]
    );

  const getElementClassName = useCallback((element) => 
    (baseClassName && stylesBundle) ? 
      stylesBundle[`${baseClassName}__${element}`] || `TrackInfoText__${element}`
      :
      `TrackInfoText__${element}`
  , [baseClassName, stylesBundle]);

  const getArtistAlbumText = useCallback(() => {
    if (props.concatArtistAlbum !== undefined && props.concatArtistAlbum) {
      let artistAlbum = artist;
      if (album) {
        artistAlbum += artistAlbum ? ' - ' : '';
        artistAlbum += album;
      }
      return (
        <span className={getElementClassName('artistAlbum')}>{artistAlbum}</span>
      );
    }
    else {
      return (
        <>
        <span className={getElementClassName('artist')}>{artist}</span>
        <span className={getElementClassName('album')}>{album}</span>
        </>
      );
    }
  }, [props.concatArtistAlbum, artist, album, getElementClassName]);

  return (
    <div className={mainClassName} onClick={props.onClick}>
      <span className={getElementClassName('title')}>{title}</span>
      {getArtistAlbumText()}
      <div className={getElementClassName('format')}>
        {formatIcon ? <img src={formatIcon} className={getElementClassName('formatIcon')} alt="" /> : null}
        <span className={getElementClassName('formatResolution')}>{formatResolution}</span>
      </div>
    </div>
  );
}

export default TrackInfoText;