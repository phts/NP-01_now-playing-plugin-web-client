import * as PIXI from 'pixi.js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { VUMeterExtended } from 'now-playing-common';
import { useAppContext } from '../../../contexts/AppContextProvider';
import { sanitizeImageUrl } from '../../../utils/track';
import { Container, Graphics, Sprite } from '@pixi/react';

export interface VUMeterPixiExtendedInfoAlbumartProps {
  src?: string;
  config: Pick<VUMeterExtended, 'albumart' | 'font'>;
}

function VUMeterPixiExtendedInfoAlbumart(props: VUMeterPixiExtendedInfoAlbumartProps) {
  const { pluginInfo, host } = useAppContext();
  const { src, config } = props;
  const { albumart: albumartConfig, font: fontConfig } = config;
  const currentSrcRef = useRef<string | null | undefined>(null);
  const [ texture, setTexture ] = useState<PIXI.Texture | null>(null);
  const [ maskRef, setMaskRef ] = useState<PIXI.Graphics | null>(null);

  useEffect(() => {
    return () => {
      if (texture) {
        texture.destroy(true);
      }
    };
  }, [ texture ]);

  const loadAlbumart = useCallback(async (src?: string): Promise<PIXI.Texture | null> => {
    if (!pluginInfo) {
      return null;
    }
    const sanitizedSrc = sanitizeImageUrl(src || null, host);

    /**
     * Use proxy to bypass any CORS restrictions that would prevent texture from being
     * obtained or used in WebGL context.
     */
    const proxyUrl = new URL('proxy', pluginInfo.appUrl);
    proxyUrl.searchParams.set('url', sanitizedSrc);

    let texture: PIXI.Texture | null;
    try {
      texture = await PIXI.Texture.fromURL(proxyUrl.toString());
    }
    catch (error) {
      console.log(`Failed to load albumart through proxy from ${sanitizedSrc}:`, error);
      if (src) {
        return loadAlbumart();
      }
      texture = null;
    }
    return texture;
  }, [ pluginInfo, host ]);

  useEffect(() => {
    if (!albumartConfig || currentSrcRef.current === src) {
      return;
    }

    let aborted = false;

    loadAlbumart(src).then((texture) => {
      if (!aborted) {
        currentSrcRef.current = texture ? src : null;
        setTexture(texture);
      }
      else if (texture) {
        texture.destroy(true);
      }
    });

    return () => {
      aborted = true;
    };
  }, [ src, albumartConfig, loadAlbumart ]);

  const drawMask = useCallback((g: PIXI.Graphics) => {
    if (!albumartConfig) {
      return;
    }
    g.clear()
      .beginFill(0xffffff)
      .drawRect(0, 0, albumartConfig.size.width, albumartConfig.size.height)
      .endFill();
  }, [ albumartConfig ]);

  if (!texture || !texture.valid || !albumartConfig) {
    return null;
  }

  // Scale to equivalent of Object-fit: cover
  const scale = Math.max(
    albumartConfig.size.width / texture.width,
    albumartConfig.size.height / texture.height
  );
  const coverWidth = texture.width * scale;
  const coverHeight = texture.height * scale;
  const offset = {
    x: (albumartConfig.size.width - coverWidth) / 2,
    y: (albumartConfig.size.height - coverHeight) / 2
  };

  let border: React.ReactNode | null = null;
  if (albumartConfig.border) {
    border = (
      <Graphics
        draw={(g: PIXI.Graphics) => {
          g.clear()
            .lineStyle({
              width: albumartConfig.border?.width,
              color: fontConfig.color
            })
            .drawRect(0, 0, albumartConfig.size.width, albumartConfig.size.height);
        }}
      />
    );
  }

  return (
    <Container
      position={albumartConfig.position}
      mask={maskRef}
      visible={!!maskRef}
    >
      <Sprite
        texture={texture}
        position={offset}
        width={coverWidth}
        height={coverHeight}
      />
      <Graphics
        ref={(node) => setMaskRef(node)}
        draw={drawMask}
      />
      {border}
    </Container>
  );
}

export default VUMeterPixiExtendedInfoAlbumart;
