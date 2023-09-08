import * as PIXI from 'pixi.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { VUMeterExtended } from 'now-playing-common';
import { usePlayerState } from '../../../contexts/PlayerProvider';
import { PlayerState } from '../../../contexts/player/PlayerStateProvider';
import { useAppContext } from '../../../contexts/AppContextProvider';
import { getFormatIcon, getFormatResolution } from '../../../utils/track';
import { Text } from '@pixi/react';
import VUMeterPixiExtendedInfoTitle from './VUMeterPixiExtendedInfoTitle';
import VUMeterPixiExtendedInfoTime from './VUMeterPixiExtendedInfoTime';
import VUMeterPixiExtendedInfoTrackType from './VUMeterPixiExtendedInfoTrackType';
import { VU_METER_FONT_FAMILY, loadMeterFonts } from '../../../utils/vumeter';
import VUMeterPixiExtendedInfoAlbumart from './VUMeterPixiExtendedInfoAlbumart';

export interface VUMeterPixiExtendedInfoProps {
  config: Pick<VUMeterExtended, 'playInfo' | 'albumart' | 'timeRemaining' | 'font'>;
}

const ELLIPSIS = '...';

// https://0x1c.dev/blog/dev/trunc-string-in-pixi/
const truncWithEllipsis = (text: string, style: PIXI.TextStyle, maxWidth: number) => {
  const chars = text.split('');
  const metrics = PIXI.TextMetrics.measureText(`${ELLIPSIS}\n${chars.join('\n')}`, style);
  const [ ellipsisWidth, ...charWidths ] = (metrics as any).lineWidths as number[];
  const { str: truncated, overflow } = charWidths.reduce(
    (data, w, i) => {
      if (data.width + w + ellipsisWidth >= maxWidth) {
        return { ...data, width: maxWidth, overflow: true };
      }
      return {
        str: data.str + chars[i],
        width: data.width + w,
        overflow: false
      };
    },
    { str: '', width: 0, overflow: false }
  );

  const result = truncated + (overflow ? ELLIPSIS : '');
  return {
    text: result,
    metrics: PIXI.TextMetrics.measureText(result, style)
  };
};

function VUMeterPixiExtendedInfo(props: VUMeterPixiExtendedInfoProps) {
  const { pluginInfo } = useAppContext();
  const playerState = usePlayerState();
  const { config } = props;
  const { playInfo: playInfoConfig, font: fontConfig, albumart: albumartConfig } = config;
  const [ fontsLoaded, setFontsLoaded ] = useState(false);

  if (!playInfoConfig) {
    return null;
  }

  useEffect(() => {
    if (fontConfig) {
      loadMeterFonts(fontConfig).then(() => {
        setFontsLoaded(true);
      });
    }

    return () => {
      setFontsLoaded(false);
    };
  }, [ fontConfig ]);

  const titleText = useMemo(() => {
    if (!playInfoConfig.title || !playerState.title) {
      return null;
    }
    const style = new PIXI.TextStyle({
      fontFamily: [ VU_METER_FONT_FAMILY[playInfoConfig.title.style], 'Roboto', 'sans-serif' ],
      fontSize: fontConfig.size[playInfoConfig.title.style],
      fill: fontConfig.color
    });
    return (
      <VUMeterPixiExtendedInfoTitle
        text={playerState.title}
        style={style}
        position={playInfoConfig.title.position}
        maxWidth={playInfoConfig.maxWidth}
        center={playInfoConfig.center}
      />
    );
  }, [ playInfoConfig, fontConfig, playerState.title ]);

  const getPlayInfoText = useCallback((
    playInfoKey: 'artist' | 'album' | 'sampleRate',
    playerStateKey: keyof PlayerState) => {

    if (!fontsLoaded) {
      return null;
    }

    const pi = playInfoConfig[playInfoKey];
    const ps = playerStateKey === 'samplerate' ? getFormatResolution(playerState) : playerState[playerStateKey];
    if (!pi || !ps) {
      return null;
    }

    let fontColor: string;
    if (playInfoKey === 'sampleRate') {
      fontColor = playInfoConfig.trackType?.color || fontConfig.color;
    }
    else {
      fontColor = fontConfig.color;
    }

    const textStyle = new PIXI.TextStyle({
      fontFamily: [ VU_METER_FONT_FAMILY[pi.style], 'Roboto', 'sans-serif' ],
      fontSize: fontConfig.size[pi.style],
      fill: fontColor
    });
    const fittedText = truncWithEllipsis(ps.toString(), textStyle, playInfoConfig.maxWidth);
    const position = {
      x: pi.position.x + (playInfoConfig.center ? (playInfoConfig.maxWidth - fittedText.metrics.width) / 2 : 0),
      y: pi.position.y
    };

    return (
      <Text
        text={fittedText.text}
        style={textStyle}
        position={position}
      />
    );
  }, [ fontsLoaded, playInfoConfig, fontConfig, playerState ]);

  const getTrackTypeComponent = () => {
    if (!playInfoConfig.trackType) {
      return null;
    }
    const formatIcon = pluginInfo ? getFormatIcon(playerState.trackType, pluginInfo.appUrl) : null;
    if (!formatIcon) {
      return null;
    }

    return (
      <VUMeterPixiExtendedInfoTrackType {...playInfoConfig.trackType} formatIconUrl={formatIcon} />
    );
  };

  const artistText = useMemo(() => getPlayInfoText('artist', 'artist'), [ getPlayInfoText ]);
  const albumText = useMemo(() => getPlayInfoText('album', 'album'), [ getPlayInfoText ]);
  const sampleRateText = useMemo(() => getPlayInfoText('sampleRate', 'samplerate'), [ getPlayInfoText ]);
  const albumart = useMemo(
    () => (<VUMeterPixiExtendedInfoAlbumart src={playerState.albumart} config={config} />),
    [ albumartConfig, fontConfig, playerState.albumart ]);

  return (
    <>
      {albumart}
      {titleText}
      {artistText}
      {albumText}
      {sampleRateText}
      {getTrackTypeComponent()}
      <VUMeterPixiExtendedInfoTime config={config} />
    </>
  );
}

export default VUMeterPixiExtendedInfo;
