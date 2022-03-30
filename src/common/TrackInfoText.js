import { useCallback } from 'react';
import { useAppContext } from '../contexts/AppContextProvider';
import './TrackInfoText.scss';
import { getFormatIcon, getFormatResolution } from '../utils/track';
import classNames from 'classnames';

const DEFAULT_TRACK_INFO_ORDER = [
  'title', 'artist', 'album', 'mediaInfo'
];

function TrackInfoText(props) {
  const { host } = useAppContext();
  const playerState = props.playerState;
  const title = playerState.title || '';
  const artist = playerState.artist || '';
  const album = playerState.album || '';
  const formatResolution = getFormatResolution(playerState);
  const formatIcon = getFormatIcon(playerState.trackType, host);
  const concatArtistAlbum = props.concatArtistAlbum !== undefined && props.concatArtistAlbum;
  const trackInfoOrder = props.trackInfoOrder || DEFAULT_TRACK_INFO_ORDER;

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

  const trackInfoContents = trackInfoOrder.map(key => {
    switch(key) {
      case 'title':
        return <span className={getElementClassName('title')}>{title}</span>;
      case 'artist':
        if (concatArtistAlbum) {
          let artistAlbum = artist;
          if (album) {
            artistAlbum += artistAlbum ? ' - ' : '';
            artistAlbum += album;
          }
          return <span className={getElementClassName('artistAlbum')}>{artistAlbum}</span>;
        }
        else {
          return <span className={getElementClassName('artist')}>{artist}</span>
        }
      case 'album':
        return concatArtistAlbum ? null : <span className={getElementClassName('album')}>{album}</span>;
      case 'mediaInfo':
        return (
          <div className={getElementClassName('format')}>
            {formatIcon ? <img src={formatIcon} className={getElementClassName('formatIcon')} alt="" /> : null}
            <span className={getElementClassName('formatResolution')}>{formatResolution}</span>
          </div>
        );
      default:
        return null;
    }
  });

  return (
    <div className={mainClassName} onClick={props.onClick}>
      {trackInfoContents}
    </div>
  );
}

export default TrackInfoText;
