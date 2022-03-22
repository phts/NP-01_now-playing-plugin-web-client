import classNames from 'classnames';
import Image from './Image';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import Button from './Button';
import './MetadataPanel.scss';
import { ServiceContext } from '../contexts/ServiceProvider';
import { NotificationContext } from '../contexts/NotificationProvider';
import { StoreContext } from '../contexts/StoreProvider';

const DEFAULT_INFO_CHOOSER_BUTTON_STYLES = {
  baseClassName: 'MetadataPanelInfoChooserButton',
  bundle: {
    'MetadataPanelInfoChooserButton': 'MetadataPanelInfoChooserButton',
    'MetadataPanelInfoChooserButton__icon': 'MetadataPanelInfoChooserButton__icon',
    'MetadataPanelInfoChooserButton--toggled': 'MetadataPanelInfoChooserButton--toggled'
  }
};

const INITIAL_SCROLL_POSITION = { x: 0, y: 0 };

const getAvailableInfoTypes = (song, album, artist) => {
  const result = [];
  if (song) {
    result.push('song');
  }
  if (artist || album) {
    if (song) {
      artist && result.push('artist');
      album && result.push('album');
    }
    else {
      album && result.push('album');
      artist && result.push('artist');
    }
  }
  if (song) {
    result.push('lyrics');
  }
  return result;
};

function MetadataPanel(props) {
  const { restoreStateKey, song, album, artist, placeholderImage, infoChooserButtonStyles } = props;
  const { metadataService } = useContext(ServiceContext);
  const showToast = useContext(NotificationContext);
  const scrollbarRefs = useRef({});

  const store = useContext(StoreContext);
  const restoreState = useMemo(() => {
    const rs = restoreStateKey ? store.get(restoreStateKey, {}, true) : null;
    if (rs) {
      if (rs.state) {
        // Reset stored state if props do not match or status is still pending 
        // completion (i.e. 'idle' or 'loading')
        const { status, forProps = {} } = rs.state;
        if ((status === 'idle' || status === 'loading') ||
          forProps.song !== song || 
          forProps.album !== album || 
          forProps.artist !== artist) {
            rs.state = { status: 'idle' };
        }
      }
      else {
        rs.state = { status: 'idle' };
      }
    }
    return rs;
  }, [restoreStateKey, store, song, album, artist]);

  const availableInfoTypes = useMemo(() => {
    return getAvailableInfoTypes(song, album, artist);
  }, [song, album, artist]);

  // Obtain default infoType from restoreState if available
  const getDefaultInfoType = useCallback(() => {
    if (restoreState && restoreState.infoType && availableInfoTypes.includes(restoreState.infoType)) {
      return restoreState.infoType;
    }
    return availableInfoTypes[0];
  }, [restoreState, availableInfoTypes]);

  const [infoType, setInfoType] = useState(getDefaultInfoType());

  const [state, setState] = useState(restoreState ? restoreState.state : { status: 'idle' });

  // Ref for keeping track of the scroll position for each infoType
  const scrollPositionsRef = useRef({});

  useEffect(() => {
    if (!infoType || !availableInfoTypes.includes(infoType)) {
      setInfoType(getDefaultInfoType());
    }
  }, [availableInfoTypes, infoType, setInfoType, getDefaultInfoType]);

  // Restore state - set scrollPositions on mount / save on unmount
  useEffect(() => {
    // On mount, set scrollPositions from restoreState
    if (restoreState && restoreState.scrollPositions) {
      scrollPositionsRef.current = {...restoreState.scrollPositions};
    }

    return () => {
      // On unmount, save current scrollPositions to restoreState
      if (restoreState) {
        restoreState.scrollPositions = {...scrollPositionsRef.current};
      }
    };
  }, [restoreState]);

  // Restore state - update when current infoType changes
  useEffect(() => {
    if (restoreState) {
      restoreState.infoType = infoType;
    }
  }, [restoreState, infoType]);

  // Restore state - update when current state changes
  useEffect(() => {
    if (restoreState) {
      restoreState.state = state;
    }
  }, [restoreState, state]);

  const baseClassName = props.styles ? props.styles.baseClassName : null;
  const stylesBundle = baseClassName ? props.styles.bundle : null;
  const extraClassNames = (props.styles ? props.styles.extraClassNames : null) || [];
  
  const getArtistAlbumText = useCallback(() => {
    let artistAlbum = artist;
    if (album) {
      artistAlbum += artistAlbum ? ' - ' : '';
      artistAlbum += album;
    }
    return artistAlbum;
  }, [artist, album]);

  const secondaryTitleText = song ? getArtistAlbumText() : (album ? artist : null);

  const mainClassName = (baseClassName && stylesBundle) ? 
    classNames(
      stylesBundle[baseClassName] || 'MetadataPanel',
      [...extraClassNames],
      !secondaryTitleText ? stylesBundle[`${baseClassName}--singleLineTitle`] || 'MetadataPanel--singleLineTitle' : null,
      availableInfoTypes.length <= 1 ? stylesBundle[`${baseClassName}--singleInfoType`] || 'MetadataPanel--singleInfoType' : null,
    )
    :
    classNames(
      'MetadataPanel',
      [...extraClassNames],
      !secondaryTitleText ? 'MetadataPanel--singleLineTitle' : null,
      availableInfoTypes.length <= 1 ? 'MetadataPanel--singleInfoType' : null,
    );

  const getElementClassName = useCallback((element) => 
    (baseClassName && stylesBundle) ? 
      stylesBundle[`${baseClassName}__${element}`] || `MetadataPanel__${element}`
      :
      `MetadataPanel__${element}`
  , [baseClassName, stylesBundle]);

  // Register listeners with metadata service
  useEffect(() => {
    if (metadataService) {
      const handleMetadataFetched = (data) => {
        const { params, info } = data;

        if ((song || album || artist) &&
          (!song || params.song === song) &&
          (!album || params.album === album) &&
          (!artist || params.artist === artist)) {
            setState({ 
              status: 'fetched', 
              info, 
              forProps: { song, album, artist }
            });
        }
      };

      const handleError = (message) => {
        showToast({
          type: 'error',
          message
        });
        setState({ 
          status: 'error', 
          error: {message},
          forProps: { song, album, artist }
        });
      };
      
      metadataService.on('fetched', handleMetadataFetched);
      metadataService.on('error', handleError);

      return () => {
        metadataService.off('fetched', handleMetadataFetched);
        metadataService.off('error', handleError);
      };
    }
  }, [metadataService, song, artist, album, setState, showToast]);

  // Fetch info when song / artist / album changes
  useEffect(() => {
    if (state.forProps && 
      state.forProps.song === song &&
      state.forProps.album === album &&
      state.forProps.artist === artist) {
        return;
    }
    const forProps = { song, album, artist };
    if (metadataService.isReady()) {
      if (song) {
        const params = {
          name: song,
          artist,
          album
        };
        metadataService.getSongInfo(params);
      }
      else if (album) {
        const params = {
          name: album,
          artist
        };
        metadataService.getAlbumInfo(params);
      }
      else if (artist) {
        const params = {
          name: artist
        };
        metadataService.getArtistInfo(params);
      }
      setState({ 
        status: (song || album || artist) ? 'loading' : 'idle',
        forProps
      });
    }
    else {
      setState({
        status: 'error',
        error: {
          message: 'Metadata service unavailable. Check that you have the latest version of the Now Playing plugin installed.'
        },
        forProps
      });
    }
  }, [metadataService, song, artist, album, state, setState]);

  // Components

  const getInfoTypeChooser = useCallback(() => {
    if (availableInfoTypes.length <= 1) {
      return null;
    }

    const buttonIcons = {
      song: 'audiotrack',
      artist: 'person_outline',
      album: 'album',
      lyrics: 'abc'
    };
    
    const handleInfoTypeButtonClicked = (e) => {
      e.stopPropagation();
      const selected = e.currentTarget.dataset.infoType;
      setInfoType(selected);
    };

    const buttons = availableInfoTypes.map(type => {
      return (
        <Button
          key={type}
          icon={buttonIcons[type]}
          styles={infoChooserButtonStyles || DEFAULT_INFO_CHOOSER_BUTTON_STYLES}
          toggleable
          toggled={infoType === type}
          onClick={handleInfoTypeButtonClicked}
          data-info-type={type} />
      );
    });
    
    return (
      <div className={getElementClassName('infoTypeChooser')}>
        {buttons}
      </div>
    );
  }, [availableInfoTypes, infoType, setInfoType, getElementClassName, infoChooserButtonStyles]);

  const getTitleBar = useCallback(() => {
    const primary = song || album || artist;

    return (
      <div className={getElementClassName('header')}>
        <div className={getElementClassName('title')}>
          {primary ? <span className={getElementClassName('title--primary')}>{primary}</span> : null}
          {secondaryTitleText ? <span className={getElementClassName('title--secondary')}>{secondaryTitleText}</span> : null}
        </div>
        {getInfoTypeChooser()}
      </div>
    );
  }, [song, artist, album, secondaryTitleText, getInfoTypeChooser, getElementClassName]);

  const getImage = useCallback(() => {
    if (state.status !== 'fetched') {
      return placeholderImage;
    }
    
    if (state.info[infoType]) {
      return state.info[infoType].image || placeholderImage;
    }
    else {
      return placeholderImage;
    }
  }, [placeholderImage, infoType, state]);

  // OverlayScrollbarsComponent handler for keeping track of scroll position for current infoType
  const onInfoScrolled = (scrollbarEl, scrolledInfoType) => {
    scrollPositionsRef.current[scrolledInfoType] = scrollbarEl.scroll().position;
  };

  const infoContents = useMemo(() => {
    scrollbarRefs.current = {};

    if (state.status === 'idle') {
      return null;
    }

    if (state.status === 'loading') {
      const infoClassNames = classNames(
        getElementClassName('info'),
        getElementClassName('info--loading'),
        getElementClassName('info--active'),
        'no-swipe');
      return (
        <div className={infoClassNames}>
          <span className="material-icons spin">rotate_right</span>
          <div>Loading...</div>
        </div>
      );
    }

    return availableInfoTypes.map((forInfoType) => {
      let contents = null, isEmpty = false;
      if (state.status === 'fetched') {
        if (forInfoType === 'song' || forInfoType === 'artist' || forInfoType === 'album') {
          const description = state.info[forInfoType] ? state.info[forInfoType].description : null;
          isEmpty = !description || description === '?';
          contents = !isEmpty ? description : `${forInfoType} description unavailable`;
        }
        else if (forInfoType === 'lyrics') {
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
              className={getElementClassName('lyrics')} 
              dangerouslySetInnerHTML={{__html: wrapper.innerHTML}} /> 
          }
          else {
            contents = `${forInfoType} unavailable`;
          }
        }
      }
      else if (state.status === 'error') {
        isEmpty = true;
        contents = state.error.message;
      }
      
      const infoClassNames = classNames(
        getElementClassName('info'),
        isEmpty ? getElementClassName('info--empty') : null,
        'no-swipe');
      const infoId = `info-${forInfoType}`;

      if (!isEmpty) {
        const supportsHover = !window.matchMedia('(hover: none)').matches;
        return (
          <OverlayScrollbarsComponent
            key={forInfoType}
            id={infoId}
            ref={el => {scrollbarRefs.current[forInfoType] = el}}
            className={infoClassNames}
            options={{
              scrollbars: {
                autoHide: supportsHover ? 'leave' : 'scroll'
              },
              callbacks: {
                onScrollStop: function() {
                  onInfoScrolled(this, forInfoType);
                }
              }
            }}>
            {contents}
          </OverlayScrollbarsComponent>
        );  
      }
      else {
        return (
          <div key={forInfoType} id={infoId} className={infoClassNames}>
            <span className='material-icons'>sentiment_very_dissatisfied</span>
            <div>{contents}</div>
          </div>
        );
      }
    });
  }, [availableInfoTypes, state, getElementClassName]);

  // Toggle 'active' class on infoType or state change
  useEffect(() => {
    const infoId = `info-${infoType}`;
    const el = document.getElementById(infoId);
    if (el) {
      el.classList.add(getElementClassName('info--active'));
    }

    return () => {
      if (el) {
        el.classList.remove(getElementClassName('info--active'));
      }
    };
  }, [state, infoType, getElementClassName]);

  // Restore scroll position when infoType changes
  useEffect(() => {
    const scrollbarEl = scrollbarRefs.current[infoType] ? scrollbarRefs.current[infoType].osInstance() : null;
    if (scrollbarEl) {
      scrollbarEl.update(true); // Need this for Chromium-based browsers
      scrollbarEl.scroll(scrollPositionsRef.current[infoType] || INITIAL_SCROLL_POSITION);
    }
  }, [infoType]);

  useEffect(() => {
    return () => {
      // Reset scrollPositions when initial state changes.
      scrollPositionsRef.current = {};
    }
  }, [state]);

  return (
    <div className={mainClassName}>
      {getTitleBar()}
      <div className={getElementClassName('contentsWrapper')}>
        <div className={getElementClassName('art')}>
          <Image className={getElementClassName('artImage')} src={getImage()} />
        </div>
        <div className={getElementClassName('infoWrapper')}>
          {infoContents}
        </div>
      </div>
    </div>
  );
}

export default MetadataPanel;
