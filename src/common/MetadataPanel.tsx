import classNames from 'classnames';
import Image from './Image';
import { SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Scrollbars } from 'rc-scrollbars';
import Button from './Button';
import SyncedLyricsPanel from './SyncedLyricsPanel';
import './MetadataPanel.scss';
import { useMetadataService } from '../contexts/ServiceProvider';
import { useToasts } from '../contexts/NotificationProvider';
import { useStore } from '../contexts/StoreProvider';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { StylesBundleProps } from './StylesBundle';
import { MetadataServiceGetInfoResult } from '../services/MetadataService';
import escapeHTML from 'escape-html';

interface MetadataPanelProps extends StylesBundleProps {
  restoreStateKey?: string;
  song?: string;
  album?: string;
  artist?: string;
  uri?: string;
  service?: string;
  placeholderImage?: string;
  infoChooserButtonStyles?: {
    baseClassName: string;
    bundle: {
      [k: string]: string;
    };
  };
  disableSyncedLyrics?: boolean;
  wrappedHeader?: boolean;
  singleLineTitle?: boolean;
  customComponent?: React.JSX.Element | null;
  displayInfoType?: MetadataPanelInfoType;
}

export type MetadataPanelInfoType = keyof MetadataServiceGetInfoResult['info'] | 'lyrics';

interface MetadataPanelRestoreState {
  infoType?: MetadataPanelInfoType;
  scrollPositions?: Partial<Record<MetadataPanelInfoType, number>>;
  state: {
    status: 'idle' | 'loading' | 'fetched' | 'error';
    info?: MetadataServiceGetInfoResult['info'];
    forProps?: {
      song?: string;
      album?: string;
      artist?: string;
      uri?: string;
      service?: string;
    }
    error?: {
      message: string;
    }
  }
}

const DEFAULT_INFO_CHOOSER_BUTTON_STYLES: MetadataPanelProps['infoChooserButtonStyles'] = {
  baseClassName: 'MetadataPanelInfoChooserButton',
  bundle: {
    'MetadataPanelInfoChooserButton': 'MetadataPanelInfoChooserButton',
    'MetadataPanelInfoChooserButton__icon': 'MetadataPanelInfoChooserButton__icon',
    'MetadataPanelInfoChooserButton--toggled': 'MetadataPanelInfoChooserButton--toggled'
  }
};

const getAvailableInfoTypes = (song: any, album: any, artist: any) => {
  const result: MetadataPanelInfoType[] = [];
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

function MetadataPanel(props: MetadataPanelProps) {
  const
    { restoreStateKey,
      song, album, artist, uri,
      service: _service, placeholderImage,
      infoChooserButtonStyles, disableSyncedLyrics = false,
      wrappedHeader = false,
      singleLineTitle = false,
      customComponent,
      displayInfoType = 'song' } = props;
  const metadataService = useMetadataService();
  const showToast = useToasts();
  const scrollbarRefs = useRef<Partial<Record<MetadataPanelInfoType, Scrollbars | null>>>({});
  const { t } = useTranslation();

  let service: string | undefined = _service;
  if (uri) {
    const serviceByUri = uri.split('/')[0];
    if (serviceByUri) {
      service = serviceByUri;
    }
  }

  const store = useStore();
  const restoreState = useMemo(() => {
    const defaultRS: MetadataPanelRestoreState = {
      state: {
        status: 'idle'
      }
    };
    const rs = restoreStateKey ? store.get<MetadataPanelRestoreState>(restoreStateKey, defaultRS, true) : null;
    if (rs) {
      if (rs.state) {
        // Reset stored state if props do not match or status is still pending
        // Completion (i.e. 'idle' or 'loading')
        const { status, forProps = {} } = rs.state;
        if ((status === 'idle' || status === 'loading') ||
          forProps.song !== song ||
          forProps.album !== album ||
          forProps.artist !== artist ||
          forProps.uri !== uri ||
          forProps.service !== service) {
          rs.state = { status: 'idle' };
        }
      }
    }
    return rs;
  }, [ restoreStateKey, store, song, album, artist, uri, service ]);

  const availableInfoTypes = useMemo(() => {
    return getAvailableInfoTypes(song, album, artist);
  }, [ song, album, artist ]);

  // Obtain default infoType from restoreState if available
  const getDefaultInfoType = useCallback(() => {
    if (restoreState && restoreState.infoType && availableInfoTypes.includes(restoreState.infoType)) {
      return restoreState.infoType;
    }
    if (availableInfoTypes.includes(displayInfoType)) {
      return displayInfoType;
    }
    return availableInfoTypes[0];
  }, [ restoreState, availableInfoTypes ]);

  const [ infoType, setInfoType ] = useState<MetadataPanelInfoType>(getDefaultInfoType());

  const [ state, setState ] = useState<MetadataPanelRestoreState['state']>(restoreState ? restoreState.state : { status: 'idle' });

  // Ref for keeping track of the scroll position for each infoType
  const scrollPositionsRef = useRef<Partial<Record<MetadataPanelInfoType, number>>>({});

  useEffect(() => {
    if (!infoType || !availableInfoTypes.includes(infoType)) {
      setInfoType(getDefaultInfoType());
    }
  }, [ availableInfoTypes, infoType, setInfoType, getDefaultInfoType ]);

  // Restore state - set scrollPositions on mount / save on unmount
  useEffect(() => {
    // On mount, set scrollPositions from restoreState
    if (restoreState && restoreState.scrollPositions) {
      scrollPositionsRef.current = { ...restoreState.scrollPositions };
    }

    return () => {
      // On unmount, save current scrollPositions to restoreState
      if (restoreState) {
        restoreState.scrollPositions = { ...scrollPositionsRef.current };
      }
    };
  }, [ restoreState ]);

  // Restore state - update when current infoType changes
  useEffect(() => {
    if (restoreState) {
      restoreState.infoType = infoType;
    }
  }, [ restoreState, infoType ]);

  // Restore state - update when current state changes
  useEffect(() => {
    if (restoreState) {
      restoreState.state = state;
    }
  }, [ restoreState, state ]);

  const baseClassName = props.styles ? props.styles.baseClassName : null;
  const stylesBundle = baseClassName ? props.styles?.bundle : null;
  const extraClassNames = (props.styles ? props.styles.extraClassNames : null) || [];

  const getArtistAlbumText = useCallback(() => {
    let artistAlbum = artist;
    if (album) {
      artistAlbum += artistAlbum ? ' - ' : '';
      artistAlbum += album;
    }
    return artistAlbum;
  }, [ artist, album ]);

  const secondaryTitleText = song ? getArtistAlbumText() : (album ? artist : null);

  const mainClassName = (baseClassName && stylesBundle) ?
    classNames(
      stylesBundle[baseClassName] || 'MetadataPanel',
      [ ...extraClassNames ],
      !secondaryTitleText ? stylesBundle[`${baseClassName}--singleLineTitle`] || 'MetadataPanel--singleLineTitle' : null,
      availableInfoTypes.length <= 1 ? stylesBundle[`${baseClassName}--singleInfoType`] || 'MetadataPanel--singleInfoType' : null,
      wrappedHeader ? stylesBundle[`${baseClassName}--wrappedHeader`] || 'MetadataPanel--wrappedHeader' : null,
      singleLineTitle ? stylesBundle[`${baseClassName}--singleLineTitle`] || 'MetadataPanel--singleLineTitle' : null
    )
    :
    classNames(
      'MetadataPanel',
      [ ...extraClassNames ],
      !secondaryTitleText ? 'MetadataPanel--singleLineTitle' : null,
      availableInfoTypes.length <= 1 ? 'MetadataPanel--singleInfoType' : null
    );

  const getElementClassName = useCallback((element: string) =>
    (baseClassName && stylesBundle) ?
      stylesBundle[`${baseClassName}__${element}`] || `MetadataPanel__${element}`
      :
      `MetadataPanel__${element}`
  , [ baseClassName, stylesBundle ]);

  // Register listeners with metadata service
  useEffect(() => {
    if (metadataService) {
      const handleMetadataFetched = (data: MetadataServiceGetInfoResult) => {
        const { params, info } = data;

        if ((song || album || artist) &&
          (!song || params.song === song) &&
          (!album || params.album === album) &&
          (!artist || params.artist === artist)) {
          setState({
            status: 'fetched',
            info,
            forProps: { song, album, artist, uri, service }
          });
        }
      };

      const handleError = (message: string) => {
        showToast({
          type: 'error',
          message
        });
        setState({
          status: 'error',
          error: { message },
          forProps: { song, album, artist, uri, service }
        });
      };

      metadataService.on('fetched', handleMetadataFetched);
      metadataService.on('error', handleError);

      return () => {
        metadataService.off('fetched', handleMetadataFetched);
        metadataService.off('error', handleError);
      };
    }
  }, [ metadataService, song, artist, album, uri, service, setState, showToast ]);

  // Fetch info when song / artist / album / uri / service changes
  useEffect(() => {
    if (state.forProps &&
      state.forProps.song === song &&
      state.forProps.album === album &&
      state.forProps.artist === artist &&
      state.forProps.uri === uri &&
      state.forProps.service === service) {
      return;
    }
    const forProps = { song, album, artist, uri, service };
    if (metadataService.isReady()) {
      if (song) {
        const params = {
          name: song,
          artist,
          album,
          uri,
          service
        };
        metadataService.getSongInfo(params);
      }
      else if (album) {
        const params = {
          name: album,
          artist,
          uri,
          service
        };
        metadataService.getAlbumInfo(params);
      }
      else if (artist) {
        const params = {
          name: artist,
          uri,
          service
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
          message: t('metadata.serviceUnavailable')
        },
        forProps
      });
    }
  }, [ metadataService, song, artist, album, uri, service, state, setState, t ]);

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

    const handleInfoTypeButtonClicked = (e: SyntheticEvent) => {
      e.stopPropagation();
      const el = e.currentTarget as HTMLElement;
      if (el.dataset.infoType) {
        setInfoType(el.dataset.infoType as MetadataPanelInfoType);
      }
    };

    const buttons = availableInfoTypes.map((type) => {
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
  }, [ availableInfoTypes, infoType, setInfoType, getElementClassName, infoChooserButtonStyles ]);

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
  }, [ song, artist, album, secondaryTitleText, getInfoTypeChooser, getElementClassName ]);

  const getImage = useCallback(() => {
    if (state.status !== 'fetched') {
      return placeholderImage;
    }

    if (infoType !== 'lyrics' && state.info?.[infoType]) {
      return state.info[infoType]?.image || placeholderImage;
    }

    return placeholderImage;

  }, [ placeholderImage, infoType, state ]);

  // Scrollbars handler for keeping track of scroll position for current infoType
  const onInfoScrolled = (scrolledInfoType: MetadataPanelInfoType) => {
    const scrollbarEl = scrollbarRefs.current[scrolledInfoType] || null;
    if (scrollbarEl) {
      scrollPositionsRef.current[scrolledInfoType] = scrollbarEl.getScrollTop();
    }
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
          <div>{t('metadata.loading')}</div>
        </div>
      );
    }

    return availableInfoTypes.map((forInfoType) => {
      let contents: React.JSX.Element | null = null, isEmpty = false;
      if (state.status === 'fetched') {
        if (forInfoType === 'song' || forInfoType === 'artist' || forInfoType === 'album') {
          const description = state.info?.[forInfoType] ? state.info[forInfoType]?.description : null;
          isEmpty = !description || description === '?';
          contents = (description && description !== '?') ? <>{description}</> : t(`metadata.${forInfoType}Unavailable`);
        }
        else if (forInfoType === 'lyrics') {
          let lyricsHTML: string | null;
          switch (state.info?.song?.lyrics?.type) {
            case 'plain':
              lyricsHTML = state.info.song.lyrics.lines
                .map((line) => escapeHTML(line))
                .join('</br>');
              break;
            case 'html':
              // Strip links
              const wrapper = document.createElement('div');
              wrapper.innerHTML = state.info.song.lyrics.lines;
              const anchors = Array.from(wrapper.getElementsByTagName('a'));
              for (const anchor of anchors) {
                anchor.replaceWith(...anchor.childNodes);
              }
              lyricsHTML = wrapper.innerHTML;
              break;
            case 'synced':
              if (disableSyncedLyrics) {
                lyricsHTML = state.info.song.lyrics.lines
                  .map((line) => escapeHTML(line.text))
                  .join('</br>');
              }
              else {
                lyricsHTML = null;
              }
              break;
            default:
              lyricsHTML = null;
          }
          if (lyricsHTML) {
            isEmpty = false;
            contents = <div
              className={getElementClassName('lyrics')}
              dangerouslySetInnerHTML={{ __html: lyricsHTML }} />;
          }
          else if (state.info?.song?.lyrics?.type === 'synced') {
            isEmpty = false;
            contents = (
              <SyncedLyricsPanel
                styles={{
                  baseClassName: 'SyncedLyricsPanel',
                  bundle: stylesBundle || undefined
                }}
                lyrics={state.info.song.lyrics} />
            );
          }
          else {
            isEmpty = true;
            contents = t(`metadata.${forInfoType}Unavailable`);
          }
        }
      }
      else if (state.status === 'error' && state.error) {
        isEmpty = true;
        contents = <>{state.error.message}</>;
      }

      const infoClassNames = classNames(
        getElementClassName('info'),
        isEmpty ? getElementClassName('info--empty') : null,
        'no-swipe');
      const infoId = `info-${forInfoType}`;

      if (!isEmpty) {
        return (
          <Scrollbars
            key={forInfoType}
            id={infoId}
            ref={(el) => {
              scrollbarRefs.current[forInfoType] = el;
            }}
            className={infoClassNames}
            classes={{
              thumbVertical: 'Scrollbar__handle'
            }}
            autoHide
            onScrollStop={() => onInfoScrolled(forInfoType)}>
            {contents}
          </Scrollbars>
        );
      }

      return (
        <div key={forInfoType} id={infoId} className={infoClassNames}>
          <span className='material-icons'>sentiment_very_dissatisfied</span>
          <div>{contents}</div>
        </div>
      );

    });
  }, [ availableInfoTypes, disableSyncedLyrics, state, getElementClassName, t ]);

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
  }, [ state, infoType, getElementClassName ]);

  // Restore scroll position when infoType changes
  useEffect(() => {
    const scrollbarEl = scrollbarRefs.current[infoType] || null;
    if (scrollbarEl) {
      scrollbarEl.scrollTop(scrollPositionsRef.current[infoType] || 0);
    }
  }, [ infoType ]);

  useEffect(() => {
    return () => {
      // Reset scrollPositions when initial state changes.
      scrollPositionsRef.current = {};
    };
  }, [ state ]);

  return (
    <div className={mainClassName}>
      {!wrappedHeader ? getTitleBar() : null}
      <div className={getElementClassName('contentsWrapper')}>
        <div className={getElementClassName('art')}>
          <Image className={getElementClassName('artImage')} src={getImage()} />
        </div>
        <div className={getElementClassName('secondaryWrapper')}>
          {wrappedHeader ? getTitleBar() : null}
          <div className={getElementClassName('infoWrapper')}>
            {infoContents}
          </div>
          {customComponent}
        </div>
      </div>
    </div>
  );
}

export default MetadataPanel;
