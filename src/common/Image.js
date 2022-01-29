import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../contexts/AppContextProvider';
import { preloadImage } from '../utils/image';
import { sanitizeImageUrl } from '../utils/track';

function Image(props) {
  const {host} = useContext(AppContext);
  const [loadedSrc, setLoadedSrc] = useState(null);
  const currentTargetSrc = useRef(null);
  const fallbackSrc = host + '/albumart';
  const targetSrc = props.src ? sanitizeImageUrl(props.src, host) : fallbackSrc;
  const {onLoad, preload} = props;
  const [directSrc, setDirectSrc] = useState(targetSrc);

  // Preload image
  useEffect(() => {
    if (!preload) {
      return;
    }
    if (currentTargetSrc.current === targetSrc) {
      return;
    }
    else {
      currentTargetSrc.current = targetSrc;
    }

    const onImageLoaded = (src) => {
      setLoadedSrc(src);
    };
    const onImageError = () => {
      setLoadedSrc(null);
    };

    const preloader = preloadImage(targetSrc, fallbackSrc, {
      'ready': onImageLoaded,
      'error': onImageError
    });
    
    return () => { preloader.dispose() };
  }, [preload, targetSrc, setLoadedSrc, fallbackSrc]);

  // Direct image
  useEffect(() => {
    if (preload) {
      return;
    }
    if (currentTargetSrc.current === targetSrc) {
      return;
    }
    else {
      currentTargetSrc.current = targetSrc;
      setDirectSrc(targetSrc);
    }
  }, [preload, targetSrc, setDirectSrc])

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
  }, [directSrc, setDirectSrc, fallbackSrc]);

  useEffect(() => {
    if (preload && onLoad) {
      onLoad(loadedSrc);
    }
  }, [loadedSrc, preload, onLoad])

  const imgAttrs = {
    'className': props.className,
    'onClick': props.onClick
  };

  if (preload) {
    imgAttrs.src = loadedSrc || '';
    imgAttrs.style = !loadedSrc ? { visibility: 'hidden' } : null;
  }
  else {
    imgAttrs.src = directSrc || '';
    imgAttrs.onError = onDirectImageError;
    imgAttrs.style = !directSrc ? { visibility: 'hidden' } : null;
    if (currentTargetSrc.current === null) {
      currentTargetSrc.current = targetSrc;
    }
    imgAttrs.onLoad = onLoad;
  }

  return (
    <img { ...imgAttrs } alt="" />
  );  
}

export default Image;
