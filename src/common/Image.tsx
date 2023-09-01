import React, { HTMLProps, useCallback, useEffect, useRef, useState } from 'react';
import { useAppContext } from '../contexts/AppContextProvider';
import { preloadImage } from '../utils/image';
import { sanitizeImageUrl } from '../utils/track';

interface ImageProps {
  src: HTMLProps<HTMLImageElement>['src'] | null;
  style?: HTMLProps<HTMLImageElement>['style'];
  className?: HTMLProps<HTMLImageElement>['className'];
  onClick?: HTMLProps<HTMLImageElement>['onClick'];
  onLoad?: (src: string | null) => void;
  preload?: boolean;
}

function Image(props: ImageProps) {
  const { host } = useAppContext();
  const [ loadedSrc, setLoadedSrc ] = useState<string | null>(null);
  const currentTargetSrc = useRef<string | null>(null);
  const fallbackSrc = `${host}/albumart`;
  const targetSrc = props.src ? sanitizeImageUrl(props.src, host) : fallbackSrc;
  const { onLoad, preload } = props;
  const [ directSrc, setDirectSrc ] = useState<string | null>(targetSrc);

  // Preload image
  useEffect(() => {
    if (!preload) {
      return;
    }
    if (currentTargetSrc.current === targetSrc) {
      return;
    }

    currentTargetSrc.current = targetSrc;


    const onImageLoaded = (src: string) => {
      setLoadedSrc(src);
    };
    const onImageError = () => {
      setLoadedSrc(null);
    };

    const preloader = preloadImage(targetSrc, fallbackSrc, {
      ready: onImageLoaded,
      error: onImageError
    });

    return () => {
      preloader.dispose();
    };
  }, [ preload, targetSrc, setLoadedSrc, fallbackSrc ]);

  // Direct image
  useEffect(() => {
    if (preload || currentTargetSrc.current === targetSrc) {
      return;
    }
    currentTargetSrc.current = targetSrc;
    setDirectSrc(targetSrc);
  }, [ preload, targetSrc, setDirectSrc ]);

  const onDirectImageError = useCallback(() => {
    if (directSrc === null) {
      return;
    }
    if (directSrc !== fallbackSrc) {
      setDirectSrc(fallbackSrc);
    }
    else {
      setDirectSrc(null);
    }
  }, [ directSrc, setDirectSrc, fallbackSrc ]);

  useEffect(() => {
    if (preload && onLoad) {
      onLoad(loadedSrc);
    }
  }, [ loadedSrc, preload, onLoad ]);

  const handleDirectImageLoaded = useCallback(() => {
    if (preload) {
      return;
    }
    if (onLoad) {
      onLoad(directSrc);
    }
  }, [ preload, onLoad, directSrc ]);

  const imgAttrs: HTMLProps<HTMLImageElement> = {
    className: props.className,
    onClick: props.onClick
  };

  if (preload) {
    imgAttrs.src = loadedSrc || '';
    imgAttrs.style = {
      ...props.style
    };
    if (!loadedSrc) {
      imgAttrs.style.visibility = 'hidden';
    }
  }
  else {
    imgAttrs.src = directSrc || '';
    imgAttrs.onError = onDirectImageError;
    imgAttrs.style = {
      ...props.style
    };
    if (!directSrc) {
      imgAttrs.style.visibility = 'hidden';
    }
    if (currentTargetSrc.current === null) {
      currentTargetSrc.current = targetSrc;
    }
    imgAttrs.onLoad = handleDirectImageLoaded;
  }

  return (
    <img {...imgAttrs} alt="" />
  );
}

export default Image;
