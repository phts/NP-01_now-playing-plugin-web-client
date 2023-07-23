import React, { HTMLProps, useCallback, useEffect, useRef, useState } from 'react';
import { useAppContext } from '../contexts/AppContextProvider';
import './TrackInfoText.scss';
import { getFormatIcon, getFormatResolution } from '../utils/track';
import classNames from 'classnames';
import Marquee from 'react-fast-marquee';
import { PlayerState } from '../contexts/player/PlayerStateProvider';
import { StylesBundleProps } from './StylesBundle';

export interface TrackInfoTextProps extends StylesBundleProps {
  playerState: PlayerState;
  concatArtistAlbum?: boolean;
  trackInfoOrder?: Array<'title' | 'artist' | 'album' | 'mediaInfo'>;
  marqueeTitle?: boolean;
  onClick?: HTMLProps<HTMLDivElement>['onClick'];
}

const DEFAULT_TRACK_INFO_ORDER = [
  'title', 'artist', 'album', 'mediaInfo'
];

function TrackInfoText(props: TrackInfoTextProps) {
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
  const stylesBundle = baseClassName ? props.styles?.bundle : null;
  const extraClassNames = (props.styles ? props.styles.extraClassNames : null) || [];

  const marqueeTitle = props.marqueeTitle;
  const [ marqueeTitleRunning, setMarqueeTitleRunningState ] = useState(false);
  const [ marqueeTitleSpeed, setMarqueeTitleSpeed ] = useState(50);
  const [ marqueeTitleRefreshing, setMarqueeTitleRefreshing ] = useState(false);
  const titleEl = useRef<HTMLSpanElement | null>(null);
  const marqueeTitleWrapperEl = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const refreshMarqueeTitle = () => {
      setMarqueeTitleRefreshing(true);
    };

    window.addEventListener('resize', refreshMarqueeTitle);

    return () => {
      window.removeEventListener('resize', refreshMarqueeTitle);
    };
  }, []);

  useEffect(() => {
    if (marqueeTitle) {
      // When title changes, we would like the marquee (if set to running) to start from the beginning.
      // Because Marquee component uses animation CSS, we need to remove the Marquee component and add it
      // Back to the DOM. We do this by using a `refreshing` flag.
      setMarqueeTitleRefreshing(true);
    }
  }, [ title, marqueeTitle ]);

  useEffect(() => {
    if (marqueeTitle) {
      if (marqueeTitleRefreshing && titleEl.current && marqueeTitleWrapperEl.current) {
        // Set marquee running state based on whether the title is wider than its container.
        if (titleEl.current.offsetWidth > marqueeTitleWrapperEl.current.offsetWidth) {
          const speed = 40 / 800 * marqueeTitleWrapperEl.current.offsetWidth;
          setMarqueeTitleRunningState(true);
          setMarqueeTitleSpeed(speed);
        }
        else {
          setMarqueeTitleRunningState(false);
        }
        setMarqueeTitleRefreshing(false);
      }
    }
  }, [ title, marqueeTitle, marqueeTitleRefreshing ]);

  const mainClassName = (baseClassName && stylesBundle) ?
    classNames(
      stylesBundle[baseClassName] || 'TrackInfoText',
      [ ...extraClassNames ]
    )
    :
    classNames(
      'TrackInfoText',
      [ ...extraClassNames ]
    );

  const getElementClassName = useCallback((element: string) => {
    let className: string;
    if (baseClassName && stylesBundle) {
      className = stylesBundle[`${baseClassName}__${element}`] || `TrackInfoText__${element}`;
      if (element === 'title' && marqueeTitle) {
        const marqueeState = marqueeTitleRunning && !marqueeTitleRefreshing ? 'marqueeRunning' : 'marqueeStopped';
        className += ` ${stylesBundle[`${baseClassName}__${element}--${marqueeState}`] || `TrackInfoText__${element}--${marqueeState}`}`;
      }
    }
    else {
      className = `TrackInfoText__${element}`;
      if (element === 'title' && marqueeTitle) {
        const marqueeState = marqueeTitleRunning && !marqueeTitleRefreshing ? 'marqueeRunning' : 'marqueeStopped';
        className += ` TrackInfoText__${element}--${marqueeState}`;
      }
    }
    return className;
  }, [ baseClassName, stylesBundle, marqueeTitle, marqueeTitleRefreshing, marqueeTitleRunning ]);

  const trackInfoContents = trackInfoOrder.map((key) => {
    switch (key) {
      case 'title':
        const _titleEl = <span ref={titleEl} key={key} className={getElementClassName('title')}>{title}</span>;
        if (marqueeTitle) {
          return (
            <div ref={marqueeTitleWrapperEl} className={getElementClassName('marqueeTitleWrapper')}>
              { marqueeTitleRunning && !marqueeTitleRefreshing ?
                <Marquee delay={2} pauseOnHover={true} speed={marqueeTitleSpeed}>{_titleEl}</Marquee> : _titleEl }
            </div>
          );
        }
        return _titleEl;

      case 'artist':
        if (concatArtistAlbum) {
          let artistAlbum = artist;
          if (album) {
            artistAlbum += artistAlbum ? ' - ' : '';
            artistAlbum += album;
          }
          return <span key="artistAlbum" className={getElementClassName('artistAlbum')}>{artistAlbum}</span>;
        }

        return <span key={key} className={getElementClassName('artist')}>{artist}</span>;

      case 'album':
        return concatArtistAlbum ? null : <span key={key} className={getElementClassName('album')}>{album}</span>;
      case 'mediaInfo':
        return (
          <div key={key} className={getElementClassName('format')}>
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
