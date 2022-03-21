import classNames from 'classnames';
import Image from './Image';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
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

const getAvailableInfoTypes = (props) => {
  const result = [];
  const {song, album, artist} = props;
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
  const scrollbarsRef = useRef(null);
  const currentScrollPositionRef = useRef(INITIAL_SCROLL_POSITION);

  const store = useContext(StoreContext);
  const restoreState = restoreStateKey ? store.get(restoreStateKey, {}, true) : null;
  const availableInfoTypes = getAvailableInfoTypes(props);
  const getInitialInfoType = () => {
    if (restoreState && restoreState.infoType && availableInfoTypes.includes(restoreState.infoType)) {
      return restoreState.infoType;
    }
    return availableInfoTypes[0];
  };
  const getInitialState = () => {
    if (restoreState && restoreState.state) {
      const { status, forProps = {} } = restoreState.state;
      return (
        (status === 'fetched' || status === 'error') && 
        forProps.song === song && 
        forProps.album === album && 
        forProps.artist === artist) 
        ? restoreState.state : { status: 'idle' };
    }
    return { status: 'idle' };
  };
  const getInitialScrollPositions = () => {
    if (restoreState && restoreState.state) {
      const { forProps = {} } = restoreState.state;
      return (
        forProps.song === song && 
        forProps.album === album && 
        forProps.artist === artist) 
        ? restoreState.scrollPositions : {};
    }
    return {};
  };
  const [infoType, setInfoType] = useState(getInitialInfoType());
  const [state, setState] = useState(getInitialState());
  const scrollPositionsRef = useRef(getInitialScrollPositions());

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

  // Update restore state

  useEffect(() => {
    if (restoreState) {
      restoreState.infoType = infoType;
    }
  }, [restoreState, infoType]);
  
  useEffect(() => {
    if (restoreState) {
      restoreState.state = state;
    }
  }, [restoreState, state]);

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

  const getInfoContents = useCallback(() => {
    if (state.status === 'idle') {
      return null;
    }

    if (state.status === 'loading') {
      const infoClassNames = classNames(
        getElementClassName('info'),
        getElementClassName('info--loading'),
        'no-swipe');
      return (
        <div className={infoClassNames}>
          <span className="material-icons spin">rotate_right</span>
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
            className={getElementClassName('lyrics')} 
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
      getElementClassName('info'),
      isEmpty ? getElementClassName('info--empty') : null,
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
  }, [state, infoType, getElementClassName]);

  // Keep track of scroll positions for each info type

  useEffect(() => {
    currentScrollPositionRef.current = INITIAL_SCROLL_POSITION;
  }, [state]);

  useEffect(() => {
    currentScrollPositionRef.current = scrollPositionsRef.current[infoType] || INITIAL_SCROLL_POSITION;

    return () => {
      scrollPositionsRef.current[infoType] = currentScrollPositionRef.current;

      // Update restore state
      if (restoreState) {
        restoreState.scrollPositions = scrollPositionsRef.current;
      }
    }
  }, [infoType, restoreState]);

  useEffect(() => {
    if (scrollbarsRef.current) {
      scrollbarsRef.current.osInstance().scroll(currentScrollPositionRef.current);
    }
  }, [infoType, state]);

  const getScrollPosition = () => {
    if (scrollbarsRef.current) {
      const scroll = scrollbarsRef.current.osInstance().scroll() || {};
      return scroll.position || INITIAL_SCROLL_POSITION;
    }
    else {
      return INITIAL_SCROLL_POSITION;
    }
  };

  currentScrollPositionRef.current = getScrollPosition();

  return (
    <div className={mainClassName}>
      {getTitleBar()}
      <div className={getElementClassName('contentsWrapper')}>
        <div className={getElementClassName('art')}>
          <Image className={getElementClassName('artImage')} src={getImage()} />
        </div>
        {getInfoContents()}
      </div>
    </div>
  );
}

export default MetadataPanel;
