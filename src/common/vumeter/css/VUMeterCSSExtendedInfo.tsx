/// <reference types="../../../declaration.d.ts" />

import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import styles from './VUMeterCSSExtendedInfo.module.scss';
import { VUMeterExtended } from 'now-playing-common';
import { usePlayerState } from '../../../contexts/PlayerProvider';
import { PlayerState } from '../../../contexts/player/PlayerStateProvider';
import { useAppContext } from '../../../contexts/AppContextProvider';
import { getFormatIcon, getFormatResolution } from '../../../utils/track';
import Image from '../../Image';
import { ReactSVG } from 'react-svg';
import VUMeterCSSExtendedInfoTime from './VUMeterCSSExtendedInfoTime';
import Marquee from 'react-fast-marquee';
import { VU_METER_FONT_FAMILY, loadMeterFonts } from '../../../utils/vumeter';

export interface VUMeterCSSExtendedInfoProps {
  config: Pick<VUMeterExtended, 'playInfo' | 'albumart' | 'timeRemaining' | 'font'>;
}

function VUMeterCSSExtendedInfo(props: VUMeterCSSExtendedInfoProps) {
  const { pluginInfo } = useAppContext();
  const playerState = usePlayerState();
  const { config } = props;
  const { playInfo, albumart, font } = config;
  const [ fontsLoaded, setFontsLoaded ] = useState(false);

  const [ marqueeTitleRunning, setMarqueeTitleRunningState ] = useState(false);
  const [ marqueeTitleSpeed, setMarqueeTitleSpeed ] = useState(50);
  const [ marqueeTitleRefreshing, setMarqueeTitleRefreshing ] = useState(false);
  const titleEl = useRef<HTMLSpanElement | null>(null);
  const marqueeTitleWrapperEl = useRef<HTMLDivElement | null>(null);

  if (!playInfo) {
    return null;
  }

  useEffect(() => {
    if (config) {
      loadMeterFonts(config.font).then(() => {
        setFontsLoaded(true);
      });
    }

    return () => {
      setFontsLoaded(false);
    };
  }, [ config ]);

  useEffect(() => {
    // When title changes, we would like the marquee (if set to running) to start from the beginning.
    // Because Marquee component uses animation CSS, we need to remove the Marquee component and add it
    // Back to the DOM. We do this by using a `refreshing` flag.
    setMarqueeTitleRefreshing(true);
  }, [ playerState.title ]);

  useEffect(() => {
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
  }, [ playerState.title, marqueeTitleRefreshing, fontsLoaded ]);

  const getAlbumartComponent = () => {
    if (!albumart || !playerState.albumart) {
      return null;
    }
    const style = {
      '--top': `${albumart.position.y}px`,
      '--left': `${albumart.position.x}px`,
      '--width': `${albumart.size.width}px`,
      '--height': `${albumart.size.height}px`
    } as React.CSSProperties;

    if (albumart.border?.width) {
      style['--border'] = `${albumart.border.width}px solid ${font.color}`;
    }

    return (
      <Image src={playerState.albumart} style={style} className={styles.AlbumArt}/>
    );
  };

  const getMarqueeTitleComponent = () => {
    if (!fontsLoaded || !playInfo.title) {
      return null;
    }

    const wrapperStyle = {
      '--top': `${playInfo.title.position.y}px`,
      '--left': `${playInfo.title.position.x}px`,
      '--width': `${playInfo.maxWidth}px`
    } as React.CSSProperties;

    const wrapperClassName = classNames([
      styles.MarqueeTitleWrapper,
      playInfo.center ? styles['MarqueeTitleWrapper--centered'] : null
    ]);

    const titleStyle = {
      '--font-family': `"${VU_METER_FONT_FAMILY[playInfo.title.style]}", var(--app-font-family)`,
      '--font-size': `${font.size[playInfo.title.style]}px`,
      '--color': font.color
    } as React.CSSProperties;

    const titleClassName = classNames([
      styles.Title,
      marqueeTitleRunning && !marqueeTitleRefreshing ?
        styles['Title--marqueeRunning'] : styles['Title--marqueeStopped']
    ]);

    const _titleEl = <span
      ref={titleEl}
      key='title'
      style={titleStyle}
      className={titleClassName}>
      {playerState.title}
    </span>;

    return (
      <div ref={marqueeTitleWrapperEl} style={wrapperStyle} className={wrapperClassName}>
        {marqueeTitleRunning && !marqueeTitleRefreshing ?
          <Marquee delay={2} pauseOnHover={true} speed={marqueeTitleSpeed}>{_titleEl}</Marquee> : _titleEl}
      </div>
    );
  };

  const getTextComponent = (
    playInfoKey: 'artist' | 'album' | 'sampleRate',
    baseClassName: string,
    playerStateKey: keyof PlayerState) => {

    if (!fontsLoaded) {
      return null;
    }

    const pi = playInfo[playInfoKey];
    const ps = playerStateKey === 'samplerate' ? getFormatResolution(playerState) : playerState[playerStateKey];
    if (!pi || !ps) {
      return null;
    }

    let fontColor: string;
    if (playInfoKey === 'sampleRate') {
      fontColor = playInfo.trackType?.color || font.color;
    }
    else {
      fontColor = font.color;
    }

    const style = {
      '--top': `${pi.position.y}px`,
      '--left': `${pi.position.x}px`,
      '--width': `${playInfo.maxWidth}px`,
      '--font-family': `"${VU_METER_FONT_FAMILY[pi.style]}", var(--app-font-family)`,
      '--font-size': `${font.size[pi.style]}px`,
      '--color': fontColor
    } as React.CSSProperties;

    const className = classNames([
      styles[baseClassName],
      playInfo.center ? styles[`${baseClassName}--centered`] : null
    ]);

    return (
      <div style={style} className={className}>{ps}</div>
    );
  };

  const getTrackTypeComponent = () => {
    if (!playInfo.trackType) {
      return null;
    }
    const formatIcon = pluginInfo ? getFormatIcon(playerState.trackType, pluginInfo.appUrl) : null;
    if (!formatIcon) {
      return null;
    }
    const style = {
      '--top': `${playInfo.trackType.position.y}px`,
      '--left': `${playInfo.trackType.position.x}px`,
      '--color': `${playInfo.trackType.color}`,
      '--width': `${playInfo.trackType.size.width}px`,
      '--height': `${playInfo.trackType.size.height}px`
    } as React.CSSProperties;

    /**
     * Can't use mask + background-color CSS to color the svg, because
     * Volumio's SVG format icons do not have mask tag. Instead, use
     * ReactSVG to inject the contents of the SVG into the document, and apply
     * `fill` CSS to the SVG's path.
     */
    return (
      <div style={style} className={styles.TrackType}>
        <ReactSVG src={formatIcon} />
      </div>
    );
  };

  return (
    <>
      {getAlbumartComponent()}
      {getMarqueeTitleComponent()}
      {getTextComponent('artist', 'Artist', 'artist')}
      {getTextComponent('album', 'Album', 'album')}
      {getTextComponent('sampleRate', 'SampleRate', 'samplerate')}
      {getTrackTypeComponent()}
      <VUMeterCSSExtendedInfoTime config={config} />
    </>
  );
}

export default VUMeterCSSExtendedInfo;
