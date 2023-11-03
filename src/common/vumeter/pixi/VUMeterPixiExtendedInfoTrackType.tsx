import * as PIXI from 'pixi.js-legacy';
import React, { useEffect, useState } from 'react';
import { Sprite } from '@pixi/react';
import * as svgson from 'svgson';

export interface VUMeterPixiExtendedInfoTrackTypeProps {
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  color: string;
  formatIconUrl: string;
}

interface FormatIconSpriteProps {
  texture: PIXI.Texture,
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
}

// https://github.com/yoksel/url-encoder/blob/master/src/js/script.js#L134
const encodeSVGPayload = (data: string) => {
  // Use single quotes instead of double to avoid encoding.
  data = data.replace(/"/g, '\'');
  data = data.replace(/>\s{1,}</g, '><');
  data = data.replace(/\s{2,}/g, ' ');

  // Using encodeURIComponent() as replacement function
  // Allows to keep result code readable
  const symbols = /[\r\n%#()<>?[\\\]^`{|}]/g;
  return data.replace(symbols, encodeURIComponent);
};

const getSVGDataURI = (payload: string) => {
  const encoded = encodeSVGPayload(payload);
  return `data:image/svg+xml,${encoded}`;
};

const setSVGFill = (svgNode: svgson.INode, color: string) => {
  if (svgNode.name === 'path') {
    svgNode.attributes.fill = color;

    if (!svgNode.attributes.style) {
      svgNode.attributes.style = '';
    }
    svgNode.attributes.style += `; fill: ${color}`;
  }

  svgNode.children.forEach((c) => setSVGFill(c, color));
};

function VUMeterPixiExtendedInfoTrackType(props: VUMeterPixiExtendedInfoTrackTypeProps) {
  const { position, size, color, formatIconUrl } = props;
  const [ formatIconSpriteProps, setFormatIconSpriteProps ] = useState<FormatIconSpriteProps | null>(null);

  useEffect(() => {
    return () => {
      if (formatIconSpriteProps?.texture) {
        formatIconSpriteProps.texture.destroy(true);
      }
    };
  }, [ formatIconSpriteProps?.texture ]);

  useEffect(() => {
    let aborted = false;
    let spriteProps: FormatIconSpriteProps | null;

    const textureFromImgElement = (dataURI: string, width: number, height: number) => {
      return new Promise<PIXI.Texture>((resolve, reject) => {
        const imgElement = new Image(width, height);
        imgElement.onload = () => {
          const texture = PIXI.Texture.from(imgElement, {width, height});
          resolve(texture);
        };
        imgElement.onerror = () => {
          reject(`Failed to obtain texture from Image element with data URI: ${dataURI}`);
        };
        imgElement.src = dataURI;
      });
    };

    const loadFormatIcon = async () => {
      try {
        // Get SVG payload
        const content = await (await fetch(formatIconUrl)).text();
        const payload = await svgson.parse(content);

        // Get view box from payload
        const viewBox = Reflect.get(payload.attributes, 'viewBox');
        if (!viewBox || typeof viewBox !== 'string') {
          throw Error('Attribute \'viewBox\' missing or invalid');
        }
        const [ width, height ] = viewBox.split(' ').slice(2);
        const vbWidth = Number(width);
        const vbHeight = Number(height);
        if (isNaN(vbWidth) || isNaN(vbHeight)) {
          throw Error('Invalid viewbox size');
        }

        // Calculate best-fit scale and size
        const scale = Math.min(
          size.width / vbWidth,
          size.height / vbHeight
        );
        const bestWidth = scale * vbWidth;
        const bestHeight = scale * vbHeight;

        // Set fill color
        setSVGFill(payload, color);

        // Create data URI from SVG payload
        const modified = svgson.stringify(payload);
        const dataURI = getSVGDataURI(modified);

        // Create PIXI texture from data URI.
        // Note that we use HTMLImageElement for scaling. If we do it with
        // Pixi (e.g. Sprite.scale), the SVG will look horrible with jagged edges.
        const texture = await textureFromImgElement(dataURI, bestWidth, bestHeight);

        // Offset to position scaled SVG at the center of area given by 'size'
        const topOffset = (size.height - bestHeight) / 2;
        const leftOffset = (size.width - bestWidth) / 2;

        // Sprite props
        spriteProps = {
          texture,
          position: {
            x: position.x + leftOffset,
            y: position.y + topOffset
          },
          width: bestWidth,
          height: bestHeight
        };
      }
      catch (error) {
        console.log(`Failed to load SVG from ${formatIconUrl}:`, error);
        spriteProps = null;
      }

      if (!aborted) {
        setFormatIconSpriteProps(spriteProps);
      }
    };

    loadFormatIcon();

    return () => {
      aborted = true;
      if (spriteProps) {
        setFormatIconSpriteProps(null);
      }
    };
  }, [ position, size, color, formatIconUrl ]);

  if (!formatIconSpriteProps || !formatIconSpriteProps.texture.valid) {
    return null;
  }

  return <Sprite {...formatIconSpriteProps} />;
}

export default VUMeterPixiExtendedInfoTrackType;
